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
    

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)