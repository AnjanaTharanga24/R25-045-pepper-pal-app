from flask import Blueprint, request, jsonify
from .services import predict_pepper

pepper_bp = Blueprint('pepper', __name__, url_prefix='/api/pepper')

@pepper_bp.route('/suggest-pepper', methods=['POST'])
def suggest_pepper():
    """
    Endpoint to suggest pepper variety based on environmental conditions
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        # Extract parameters from request
        elevation = data.get('elevation')
        annual_rainfall = data.get('annual_rainfall')
        avg_temperature = data.get('avg_temperature')
        humidity = data.get('humidity')
        soil_texture = data.get('soil_texture')
        soil_quality = data.get('soil_quality')
        drainage = data.get('drainage')

        # Check if all required fields are present
        required_fields = [
            'elevation', 'annual_rainfall', 'avg_temperature', 
            'humidity', 'soil_texture', 'soil_quality', 'drainage'
        ]
        
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        # Convert numerical values to appropriate types
        try:
            elevation = float(elevation)
            annual_rainfall = float(annual_rainfall)
            avg_temperature = float(avg_temperature)
            humidity = float(humidity)
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Invalid numerical values. Elevation, annual_rainfall, avg_temperature, and humidity must be numbers.'
            }), 400

        # Validate numerical ranges (optional but recommended)
        if not (0 <= humidity <= 100):
            return jsonify({'error': 'Humidity must be between 0 and 100'}), 400
        
        if elevation < 0:
            return jsonify({'error': 'Elevation cannot be negative'}), 400
        
        if annual_rainfall < 0:
            return jsonify({'error': 'Annual rainfall cannot be negative'}), 400

        # Use the prediction service
        variety = predict_pepper(
            elevation, annual_rainfall, avg_temperature, 
            humidity, soil_texture, soil_quality, drainage
        )

        return jsonify({
            'success': True,
            'predicted_variety': variety,
            'input_parameters': {
                'elevation': elevation,
                'annual_rainfall': annual_rainfall,
                'avg_temperature': avg_temperature,
                'humidity': humidity,
                'soil_texture': soil_texture,
                'soil_quality': soil_quality,
                'drainage': drainage
            }
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@pepper_bp.route('/varieties', methods=['GET'])
def get_varieties():
    """
    Endpoint to get available pepper varieties (optional)
    """
    try:
        # You can implement this to return available varieties
        varieties = [
            "Highland Pepper Variety",
            "Wet Climate Pepper Variety", 
            "Standard Pepper Variety"
            # Add more varieties as needed
        ]
        
        return jsonify({
            'success': True,
            'varieties': varieties
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500