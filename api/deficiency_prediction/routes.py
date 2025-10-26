# routes.py
from flask import Blueprint, request, jsonify
from .services import DeficiencyPredictionService
from .leaf_identification import LeafIdentificationService

deficiency_bp = Blueprint('deficiency', __name__, url_prefix='/api/deficiency')

@deficiency_bp.route('/predict', methods=['POST'])
def predict_deficiency():
    try:
        # Check if image is provided
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        image_file = request.files['image']
        
        # Check if file is empty
        if image_file.filename == '':
            return jsonify({'error': 'No image selected'}), 400

        # Get age parameter
        age = request.form.get('age')
        if not age:
            return jsonify({'error': 'Age parameter is required'}), 400

        try:
            age = int(age)
            if age < 0:
                return jsonify({'error': 'Age must be a positive number'}), 400
        except ValueError:
            return jsonify({'error': 'Age must be a valid number'}), 400

        # Read image bytes
        image_bytes = image_file.read()
        
        # First, verify it's a pepper leaf
        leaf_service = LeafIdentificationService()
        leaf_type = leaf_service.predict_leaf_type(image_bytes)
        
        if leaf_type["predicted_class"] != "Pepper" or leaf_type["confidence"] < 0.8:
            return jsonify({
                'status': 'error',
                'message': 'Please upload a Pepper leaf image',
                'detected_leaf': leaf_type["predicted_class"],
                'confidence': float(leaf_type["confidence"])
            }), 400
        
        # Get deficiency prediction
        service = DeficiencyPredictionService()
        result = service.predict_deficiency(image_bytes, age)
        
        return jsonify({
            'status': 'success',
            'data': result
        }), 200

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'An error occurred during prediction: {str(e)}'
        }), 500

@deficiency_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'deficiency-prediction'
    }), 200