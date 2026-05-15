from config import db

class SavedFood(db.Model):
    """Model to store products/ingredients saved by the user."""
    id = db.Column(db.Integer, primary_key=True)
    product_name = db.Column(db.String(200), nullable=False)
    verdict = db.Column(db.String(20), nullable=False) # halal, haram, uncertain
    reason = db.Column(db.Text, nullable=True)
    confidence = db.Column(db.Float, nullable=True)
    timestamp = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_json(self):
        return {
            "id": self.id,
            "productName": self.product_name,
            "verdict": self.verdict,
            "reason": self.reason,
            "confidence": self.confidence,
            "timestamp": self.timestamp.isoformat()
        }