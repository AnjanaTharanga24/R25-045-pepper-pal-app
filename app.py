import os
import warnings

os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

from flask import Flask
from flask_cors import CORS
from api.price_prediction.routes import price_bp
from api.district_prediction.routes import district_bp
from api.new_price_prediction.routes import new_price_bp
from api.diseases_detection.routes import disease_bp
from api.pepper_recommendation.routes import pepper_bp
from api.deficiency_prediction.routes import deficiency_bp  

def create_app():
    app = Flask(__name__)
    CORS(app)
    app.config['JSON_SORT_KEYS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024
    
    app.register_blueprint(price_bp)
    app.register_blueprint(district_bp)
    app.register_blueprint(new_price_bp)
    app.register_blueprint(disease_bp)
    app.register_blueprint(pepper_bp)
    app.register_blueprint(deficiency_bp)
    
    @app.route('/')
    def home():
        return {
            "status": "healthy", 
            "message": "Pepper Plant Analysis API",
            "version": "1.0.0",
            "services": [
                {
                    "name": "price-prediction",
                    "endpoint": "/api/price",
                    "description": "Predict pepper prices"
                },
                {
                    "name": "district-prediction", 
                    "endpoint": "/api/district",
                    "description": "Predict suitable districts"
                },
                {
                    "name": "new-price-prediction",
                    "endpoint": "/api/new-price", 
                    "description": "Advanced price prediction"
                },
                {
                    "name": "disease-detection",
                    "endpoint": "/api/disease",
                    "description": "Detect plant diseases"
                },
                {
                    "name": "pepper-recommendation",
                    "endpoint": "/api/pepper",
                    "description": "Get pepper variety recommendations and climate/soil data"
                },
                {
                    "name": "deficiency-prediction", 
                    "endpoint": "/api/deficiency",
                    "description": "Detect nutrient deficiencies and get fertilizer recommendations"
                }
            ]
        }
    
    @app.route('/health')
    def health_check():
        return {
            "status": "healthy",
            "message": "All services are running"
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=8000, debug=True)