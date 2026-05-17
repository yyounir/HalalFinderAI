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
    """Forward uploaded image directly to Gemini multimodal API.
    Tries several candidate payload shapes that Gemini may accept for images.
    Returns parsed JSON result from the model if available, otherwise aggregated errors.
    """
    file = request.files.get('file')
    if not file:
        return jsonify({"error": "No file uploaded"}), 400

    filename = file.filename or 'uploaded_image'
    api_key = os.getenv('GEMINI_API_KEY')
    if not api_key:
        return jsonify({"productName": filename, "verdict": "uncertain", "reason": "Server missing GEMINI_API_KEY", "confidence": 0.0}), 500

    try:
        raw = file.read()
        import base64
        b64 = base64.b64encode(raw).decode('utf-8')
        mime_type = file.mimetype or 'application/octet-stream'

        # First try: use Google Vision OCR to extract text from the image and analyze text.
        try:
            vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
            vision_payload = {
                "requests": [
                    {
                        "image": {"content": b64},
                        "features": [{"type": "TEXT_DETECTION", "maxResults": 1}]
                    }
                ]
            }
            vresp = requests.post(vision_url, headers={"Content-Type": "application/json"}, json=vision_payload, timeout=30)
            if vresp.ok:
                vdata = vresp.json()
                annotations = vdata.get("responses", [])[0] if isinstance(vdata.get("responses"), list) and vdata.get("responses") else {}
                text_found = None
                if annotations:
                    fta = annotations.get("fullTextAnnotation")
                    if fta and fta.get("text"):
                        text_found = fta.get("text")
                    else:
                        tas = annotations.get("textAnnotations") or []
                        if len(tas) > 0 and tas[0].get("description"):
                            text_found = tas[0].get("description")

                if text_found:
                    result = detect_halal_text(text_found)
                    return jsonify(result)
                # If no text found, fall through to attempting multimodal Gemini calls below
            else:
                # If Vision returns a client error (e.g., API key not enabled), log and continue to Gemini attempts
                print(f"Vision OCR failed: {vresp.status_code} {vresp.text[:500]}")
        except Exception as e:
            print(f"Vision OCR request error: {e}")

        # If OCR didn't extract useful text, attempt Gemini multimodal payloads (kept minimal)
        model = 'gemini-2.5-flash'
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"

        system_prompt = (
            "You are an expert Islamic Dietary Law (Halal) specialist. Given the provided image, "
            "analyze the product label/text and respond ONLY in valid JSON with keys: "
            "productName, verdict (halal|haram|uncertain), reason, confidence, flaggedIngredients[]."
        )

        generation_cfg = {"responseMimeType": "application/json", "temperature": 0.0}

        # Minimal candidate: use instances content imageBytes
        candidates = [
            {
                "instances": [
                    {"content": {"image": {"imageBytes": b64, "mimeType": mime_type}}}
                ],
                "systemInstruction": {"parts": [{"text": system_prompt}]},
                "generationConfig": generation_cfg
            }
        ]

        errors = []
        for payload in candidates:
            try:
                resp = requests.post(url, headers={"Content-Type": "application/json"}, json=payload, timeout=60)
            except Exception as e:
                errors.append({"error": str(e)})
                continue

            if not resp.ok:
                # Log the response for server-side debugging but do not echo large API error bodies to clients
                print(f"Gemini multimodal attempt failed: status={resp.status_code}")
                errors.append({"status": resp.status_code})
                continue

            try:
                data = resp.json()
            except Exception as e:
                errors.append({"error": f"invalid json response: {e}"})
                continue

            # Try to parse standard candidate structure
            try:
                if isinstance(data, dict) and "candidates" in data:
                    text_blob = data["candidates"][0]["content"]["parts"][0]["text"]
                    try:
                        parsed = json.loads(text_blob)
                        return jsonify(parsed)
                    except Exception:
                        return jsonify({"raw": text_blob})

                if isinstance(data, dict) and "output" in data:
                    return jsonify(data)

                return jsonify(data)
            except Exception as e:
                errors.append({"error": str(e)})

        # All attempts failed
        print(f"All Gemini payload attempts failed: {errors}")
        # As a fallback, try Google Vision OCR to extract text and analyze that text
        try:
            vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={api_key}"
            vision_payload = {
                "requests": [
                    {
                        "image": {"content": b64},
                        "features": [{"type": "TEXT_DETECTION", "maxResults": 1}]
                    }
                ]
            }
            vresp = requests.post(vision_url, headers={"Content-Type": "application/json"}, json=vision_payload, timeout=30)
            if vresp.ok:
                vdata = vresp.json()
                # Try to extract full text from Vision response
                annotations = vdata.get("responses", [])[0] if isinstance(vdata.get("responses"), list) and vdata.get("responses") else {}
                text_found = None
                if annotations:
                    # Prefer fullTextAnnotation if present
                    fta = annotations.get("fullTextAnnotation")
                    if fta and fta.get("text"):
                        text_found = fta.get("text")
                    else:
                        # Fallback to textAnnotations[0].description
                        tas = annotations.get("textAnnotations") or []
                        if len(tas) > 0 and tas[0].get("description"):
                            text_found = tas[0].get("description")

                if text_found:
                    # Delegate to existing text analyzer
                    result = detect_halal_text(text_found)
                    return jsonify(result)
                else:
                    errors.append({"vision": vdata})
            else:
                errors.append({"vision_status": vresp.status_code, "vision_body": vresp.text[:2000]})
        except Exception as e:
            errors.append({"vision_error": str(e)})

        return jsonify({"productName": filename, "verdict": "uncertain", "reason": "All Gemini payload attempts failed. See server logs.", "errors": errors}), 502

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