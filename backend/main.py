# This file contains the /detect, /save_food, /saved_foods, and /delete_food routes

from flask import request, jsonify
from config import app, db
from models import SavedFood
import os
import openai
import re
import requests
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# (The existing detect_halal_text function remains the same as before)
def detect_halal_text(text: str):
    # ... existing AI and heuristic logic ...
    # Note: Using the logic from your previous main.py
    text_clean = (text or "").strip()
    if not text_clean:
        return {"verdict": "uncertain", "reason": "No text provided", "confidence": 0.0}

    # Common keywords that is not halal under standards:
    haram_keywords = ["pork", "porcine", "lard", "gelatin", "bacon", "ham", "pancetta", "blood", "rum", "alcohol"]
    

    lowered = text_clean.lower() # Make the out a lowercase letter
    for kw in haram_keywords:
        if kw in lowered:
            return {"verdict": "haram", "reason": f"Found keyword '{kw}'", "confidence": 0.9}
        # AI sets confidence to determine if the food is halal or not
    
    # This returns if there are no indicators found from the search
    return {"verdict": "uncertain", "reason": "No clear indicators found.", "confidence": 0.4}

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
    return jsonify(result)

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