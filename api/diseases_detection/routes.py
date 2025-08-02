from flask import Blueprint, request, jsonify
from .services import DiseaseDetectionService
from .schemas import DiseaseDetectionResponseSchema, ErrorResponseSchema

# Create blueprint
disease_bp = Blueprint('disease', __name__, url_prefix='/api/disease')

# Initialize service
disease_service = DiseaseDetectionService()

# Initialize schemas
disease_response_schema = DiseaseDetectionResponseSchema()
error_response_schema = ErrorResponseSchema()

@disease_bp.route('/predict', methods=['POST'])
def predict_disease():
    """
    Predict pepper plant disease from uploaded image
    ---
    tags:
      - Disease Detection
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: Image file of pepper plant
    responses:
      200:
        description: Disease prediction successful
        schema:
          $ref: '#/definitions/DiseaseDetectionResponse'
      400:
        description: Bad request - no file provided or invalid file
        schema:
          $ref: '#/definitions/ErrorResponse'
      500:
        description: Internal server error
        schema:
          $ref: '#/definitions/ErrorResponse'
    """
    try:
        # Check if file is provided
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Process the file and get prediction
        result = disease_service.predict_disease(file)
        
        return jsonify(result), 200
        
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

@disease_bp.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for disease detection service
    ---
    tags:
      - Disease Detection
    responses:
      200:
        description: Service is healthy
        schema:
          type: object
          properties:
            status:
              type: string
              example: healthy
            service:
              type: string
              example: disease-detection
    """
    return jsonify({
        'status': 'healthy',
        'service': 'disease-detection'
    }), 200