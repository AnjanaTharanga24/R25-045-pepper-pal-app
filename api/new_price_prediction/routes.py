from flask import Blueprint, request, jsonify
from .services import PricePredictionService
import os

# Initialize blueprint
new_price_bp = Blueprint('new_price', __name__, url_prefix='/api/new-price')

@new_price_bp.route('/predict', methods=['POST'])
def predict():
    """Price prediction endpoint"""
    try:
        # Get input data
        input_data = request.get_json()
        
        # Initialize service (assuming model is in pickle_models folder)
        model_path = os.path.join(
            os.path.dirname(__file__),
            '..', '..', 'pickle_models', 'price_predictor.cbm'
        )
        service = PricePredictionService(model_path)
        
        # Make prediction
        prediction = service.validate_and_predict(input_data)
        
        return jsonify({
            'predicted_price': prediction,
            'status': 'success'
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 400

@new_price_bp.route('/health')
def health_check():
    return jsonify({"status": "healthy"})