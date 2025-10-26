# api/pepper_recommendation/routes.py
from flask import Blueprint, request, jsonify
from .services import predict_pepper, get_climate_data, get_soil_data, get_soil_and_pepper_data

pepper_bp = Blueprint('pepper', __name__, url_prefix='/api/pepper')

@pepper_bp.route('/suggest-pepper', methods=['POST'])
def suggest_pepper():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        elevation = data.get('elevation')
        annual_rainfall = data.get('annual_rainfall')
        avg_temperature = data.get('avg_temperature')
        humidity = data.get('humidity')
        soil_texture = data.get('soil_texture')
        soil_quality = data.get('soil_quality')
        drainage = data.get('drainage')

        required_fields = [
            'elevation', 'annual_rainfall', 'avg_temperature', 
            'humidity', 'soil_texture', 'soil_quality', 'drainage'
        ]
        
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        try:
            elevation = float(elevation)
            annual_rainfall = float(annual_rainfall)
            avg_temperature = float(avg_temperature)
            humidity = float(humidity)
        except (ValueError, TypeError):
            return jsonify({
                'error': 'Invalid numerical values. Elevation, annual_rainfall, avg_temperature, and humidity must be numbers.'
            }), 400

        if not (0 <= humidity <= 100):
            return jsonify({'error': 'Humidity must be between 0 and 100'}), 400
        
        if elevation < 0:
            return jsonify({'error': 'Elevation cannot be negative'}), 400
        
        if annual_rainfall < 0:
            return jsonify({'error': 'Annual rainfall cannot be negative'}), 400

        variety = predict_pepper(
            elevation, annual_rainfall, avg_temperature, humidity, 
            soil_texture, soil_quality, drainage
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

@pepper_bp.route('/get-climate-data', methods=['POST'])
def climate_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        district = data.get('district')
        ds_division = data.get('ds_division')

        required_fields = ['district', 'ds_division']
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        try:
            district = str(district).strip()
            ds_division = str(ds_division).strip()
        except (ValueError, TypeError):
            return jsonify({'error': 'District and DS Division must be valid strings'}), 400

        climate_data = get_climate_data(district, ds_division)
        
        if climate_data is None:
            return jsonify({
                'success': False,
                'error': f'No climate data found for {district} - {ds_division}'
            }), 404

        return jsonify({
            'success': True,
            'climate_data': climate_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@pepper_bp.route('/get-soil-data', methods=['POST'])
def soil_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        soil_type = data.get('soil_type')

        if not soil_type:
            return jsonify({'error': 'Missing required field: soil_type'}), 400

        try:
            soil_type = str(soil_type).strip()
        except (ValueError, TypeError):
            return jsonify({'error': 'Soil type must be a valid string'}), 400

        soil_data = get_soil_data(soil_type)
        
        if soil_data is None:
            return jsonify({
                'success': False,
                'error': f'No soil data found for {soil_type}'
            }), 404

        return jsonify({
            'success': True,
            'soil_data': soil_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@pepper_bp.route('/get-soil-and-pepper-data', methods=['POST'])
def soil_and_pepper_data():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        soil_type = data.get('soil_type')
        ds_division = data.get('ds_division')

        required_fields = ['soil_type', 'ds_division']
        missing_fields = [field for field in required_fields if field not in data or data[field] is None]
        if missing_fields:
            return jsonify({
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        try:
            soil_type = str(soil_type).strip()
            ds_division = str(ds_division).strip()
        except (ValueError, TypeError):
            return jsonify({'error': 'Soil type and DS Division must be valid strings'}), 400

        soil_pepper_data = get_soil_and_pepper_data(soil_type, ds_division)
        
        if soil_pepper_data is None:
            return jsonify({
                'success': False,
                'error': f'No data found for soil type {soil_type} in {ds_division}'
            }), 404

        return jsonify({
            'success': True,
            'soil_pepper_data': soil_pepper_data
        }), 200

    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@pepper_bp.route('/varieties', methods=['GET'])
def get_varieties():
    try:
        varieties = [
            "Highland Pepper Variety",
            "Wet Climate Pepper Variety", 
            "Standard Pepper Variety",
            "Dry Climate Pepper Variety",
            "Lowland Pepper Variety"
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