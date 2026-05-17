# This file contains the /detect, /save_food, /saved_foods, and /delete_food routes

from flask import request, jsonify
from config import app, db
from models import SavedFood
import os
import json 
import requests
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

def detect_halal_text(text: str):
    text_clean = (text or "").strip()
    if not text_clean:
        return {"verdict": "uncertain", "reason": "Nothing was provided", "confidence": 0.0}
    
    # The API key is securely being stored in the .env file
    api_key = os.getenv("GEMINI_API_KEY")

    # The fallback to basic keywords if the .env file isnt working correctly:
    if not api_key:
        haram_keywords = ["pork", "porcine", "lard", "gelatin", "bacon", "ham", "pancetta", "blood", "rum", "alcohol"]
        lowered = text_clean.lower()
        for kw in haram_keywords:
            if kw in lowered:
                return {"productName": text_clean[:30], "verdict": "haram", "reason": f"Found keyword '{kw}' (Fallback Mode)", "confidence": 0.9}
        return {"productName": text_clean[:30], "verdict": "uncertain", "reason": "No clear indicators found. (API Key missing in backend)", "confidence": 0.4}
    
    # Connect to the AI API to launch the Gemini Model -_-
    model = 'gemini-2.5-flash'
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
    
    system_prompt = """
      You are an expert Islamic Dietary Law (Halal) specialist. Analyze the text.
      Respond ONLY in valid JSON:
      {
        "productName": "string",
        "verdict": "halal" | "haram" | "uncertain",
        "reason": "string",
        "confidence": number,
        "flaggedIngredients": [{ "name": "string", "status": "haram" | "mushbooh", "explanation": "string" }]
      }
    """

    payload = {
        "contents": [{"parts": [{"text": text_clean}]}],
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1}
    }

    # Attempt to try to call Gemini API, if not, it would return as an exception where the AI wouldnt be responding
    try:
        response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload)
        response.raise_for_status()
        data = response.json()
        
        # Parse the JSON response provided by Gemini
        result_text = data["candidates"][0]["content"]["parts"][0]["text"]
        result_json = json.loads(result_text)
        return result_json
    
    except Exception as e:
        print(f"Error calling AI: {e}")
        return {
            "productName": text_clean[:30] + "..." if len(text_clean) > 30 else text_clean,
            "verdict": "uncertain",
            "reason": "Failed to analyze with AI. Check backend terminal for errors.",
            "confidence": 0.0
        }


@app.route("/detect", methods=["POST"])
def detect():
    # Detector for what the user enters or picture of what the user sends
    data = request.get_json(silent=True) or {}
    text = data.get("text") or data.get("name", "")
    if not text:
        return jsonify({"error": "Provide text in JSON body."}), 400
    result = detect_halal_text(text)
    return jsonify(result)


@app.route('/detect_file', methods=['POST'])
def detect_file():
    """Accept an uploaded image, forward it to the Gemini Generative Language API as image content,
    and return the parsed JSON response expected from the model.
    """
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = file.filename or 'uploaded_image'
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"productName": filename, "verdict": "uncertain", "reason": "Server missing GEMINI_API_KEY", "confidence": 0.0}), 500

    # Read image bytes and base64-encode for inclusion in the Gemini request
    try:
        raw = file.read()
        import base64
        b64 = base64.b64encode(raw).decode('utf-8')
        mime_type = getattr(file, 'mimetype', 'image/jpeg') or 'image/jpeg'

        model = 'gemini-2.5-flash'
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        system_prompt = """
        You are an expert Islamic Dietary Law (Halal) specialist. Analyze the provided product image.
        If the image contains an ingredients list, try to read it, otherwise respond and determine whether the product is halal, haram, or uncertain based on the product name.
        Respond ONLY in valid JSON with the following structure:
        {
          "productName": "string",
          "verdict": "halal" | "haram" | "uncertain",
          "reason": "string",
          "confidence": number,
          "flaggedIngredients": [{ "name": "string", "status": "haram" | "mushbooh", "explanation": "string" }]
        }
        """

        # Correct payload shape for Gemini Multimodal input
        payload = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [
                {
                    "parts": [
                        {"text": "Analyze this image and identify the ingredients, then evaluate their halal status."},
                        {"inlineData": {"mimeType": mime_type, "data": b64}}
                    ]
                }
            ],
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.0}
        }

        response = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=60)
        
        if not response.ok:
            return jsonify({"productName": filename, "verdict": "uncertain", "reason": f"API Error: {response.text[:200]}", "confidence": 0.0}), 502

        data = response.json()
        
        # Parse candidate response format
        if isinstance(data, dict) and "candidates" in data:
            result_text = data["candidates"][0]["content"]["parts"][0]["text"]
            result_json = json.loads(result_text)
            return jsonify(result_json)
        else:
            return jsonify({"productName": filename, "verdict": "uncertain", "reason": "Failed to parse Gemini response.", "raw": data}), 502

    except requests.exceptions.RequestException as e:
        print(f"Error calling Gemini for image: {e}")
        return jsonify({"productName": filename, "verdict": "uncertain", "reason": "Failed to call Gemini API for image analysis.", "confidence": 0.0}), 500
    except Exception as e:
        print(f"detect_file unexpected error: {e}")
        return jsonify({"productName": filename, "verdict": "uncertain", "reason": "Unexpected server error during image analysis.", "confidence": 0.0}), 500


# CRUD Ops
@app.route("/saved_foods", methods=["GET"])
def get_saved_foods():
    # Retrieves all the saved foods from the SQL database -_- 
    saved_items = SavedFood.query.all()
    # FIX: Loop through the items and convert them to JSON
    return jsonify([item.to_json() for item in saved_items])

@app.route("/save_food", methods=["POST"])
def save_food():
    # This function would save a new food item result to the SQL database -_-
    data = request.json

    if not data.get("productName") or not data.get("verdict"):
        return jsonify({"error": "Missing required fields"}), 400
    
    new_saved = SavedFood(
        product_name = data.get("productName"),
        verdict = data.get("verdict"),
        reason = data.get("reason"),
        confidence = data.get("confidence")
    )

    try:
        db.session.add(new_saved)
        db.session.commit()
        return jsonify({"message": "Item saved successfully!", "item": new_saved.to_json()}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    
@app.route("/delete_food/<int:food_id>", methods=["DELETE"])
def delete_food(food_id):
    """Delete a saved food item from the database."""
    item = SavedFood.query.get(food_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404
    
    # Attempt to delete a food item from the database
    try:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"message": "Item deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

@app.route("/update_food/<int:food_id>", methods=["PUT"]) 
def update_food(food_id):
    """Update a saved food item."""
    data = request.get_json(silent=True) or {}
    item = SavedFood.query.get(food_id)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    # Map incoming JSON keys to model fields
    if 'productName' in data:
        item.product_name = data.get('productName')
    if 'verdict' in data:
        item.verdict = data.get('verdict')
    if 'reason' in data:
        item.reason = data.get('reason')
    if 'confidence' in data:
        item.confidence = data.get('confidence')

    try:
        db.session.commit()
        return jsonify({"message": "Item updated successfully", "item": item.to_json()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
    

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)