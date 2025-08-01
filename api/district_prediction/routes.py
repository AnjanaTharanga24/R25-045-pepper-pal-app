from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .services import predict_district_price
from .schemas import DistrictPredictionRequestSchema, DistrictPredictionResponseSchema

# Create the blueprint first
district_bp = Blueprint('district', __name__, url_prefix='/district')

@district_bp.route("/predict", methods=["POST"])
def predict():
    """District prediction endpoint"""
    try:
        request_data = request.get_json()
        validated_data = DistrictPredictionRequestSchema().load(request_data)
        
        result = predict_district_price(
            district=validated_data["district"],
            target_date=validated_data["target_date"]
        )
        
        return DistrictPredictionResponseSchema().dump(result)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@district_bp.route("/models", methods=["GET"])
def available_models():
    """List available district models"""
    # Implement this endpoint
    pass

@district_bp.route("/history/<district>", methods=["GET"])
def get_history(district):
    """Get district price history"""
    # Implement this endpoint
    pass