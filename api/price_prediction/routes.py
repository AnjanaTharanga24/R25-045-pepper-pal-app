from flask import Blueprint, request, jsonify
from flask import send_from_directory
from .services import predict_price
from .schemas import (
    PredictionRequestSchema,
    PredictionResponseSchema,
    HistoryResponseSchema,
    ModelsResponseSchema
)
from marshmallow import ValidationError

price_bp = Blueprint('price', __name__, url_prefix='/price')

@price_bp.route("/predict", methods=["POST"])
def predict():
    """Prediction endpoint"""
    try:
        request_data = request.get_json()
        validated_data = PredictionRequestSchema().load(request_data)
        
        result = predict_price(
            validated_data["pepper_type"],
            validated_data["target_date"]
        )
        
        return PredictionResponseSchema().dump(result)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@price_bp.route("/", methods=["GET"])
def price_ui():
    return send_from_directory('static', 'new.html')

@price_bp.route("/models", methods=["GET"])
def available_models():
    """List available models"""
    pass

@price_bp.route("/history/<pepper_type>", methods=["GET"])
def get_history(pepper_type):
    """Get price history"""
    pass