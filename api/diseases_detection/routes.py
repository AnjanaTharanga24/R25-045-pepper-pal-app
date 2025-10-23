from flask import Blueprint, request, jsonify
from .services import DiseaseDetectionService
from .schemas import DiseaseDetectionResponseSchema, ErrorResponseSchema

# Define the blueprint
disease_bp = Blueprint('disease', __name__, url_prefix='/api/disease')

# Initialize service & schemas
disease_service = DiseaseDetectionService()
disease_response_schema = DiseaseDetectionResponseSchema()
error_response_schema = ErrorResponseSchema()


@disease_bp.route('/predict', methods=['POST'])
def predict_disease():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        result = disease_service.predict_disease(file)
        
        # Optional: Return 400 status if Non-Pepper_Source is detected
        if result.get('disease') == 'Non-Pepper_Source':
            return jsonify(result), 400
        
        return jsonify(result), 200

    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500


@disease_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'disease-detection'
    }), 200