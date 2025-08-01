from flask import Flask
from flask_cors import CORS
from api.price_prediction.routes import price_bp
from api.district_prediction.routes import district_bp
from api.new_price_prediction.routes import new_price_bp  # Add this import

def create_app():
    app = Flask(__name__)
    CORS(app)  # Enable CORS for all routes
    app.config['JSON_SORT_KEYS'] = False
    
    # Register blueprints
    app.register_blueprint(price_bp)
    app.register_blueprint(district_bp)
    app.register_blueprint(new_price_bp)  # Add this line
    
    @app.route('/')
    def home():
        return {
            "status": "healthy", 
            "services": ["price", "district", "new-price"]
        }
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host="0.0.0.0", port=8000, debug=True)