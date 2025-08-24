import pandas as pd
from .models import PricePredictionModel
from .schemas import PricePredictionInputSchema

class PricePredictionService:
    def __init__(self, model_path):
        self.model = PricePredictionModel().load_model(model_path)
        self.schema = PricePredictionInputSchema()
    
    def validate_and_predict(self, input_data):
        """Validate input and make prediction"""
        errors = self.schema.validate(input_data)
        if errors:
            raise ValueError(errors)
        
        processed_data = self._preprocess_input(input_data)
        input_df = pd.DataFrame([processed_data])[self.model.columns_order]
        
        return float(self.model.model.predict(input_df)[0])
    
    def _preprocess_input(self, input_data):
        """Convert input data to model-ready format"""
        seasonality = input_data['seasonality'].lower()
        price_type = input_data['price_type'].upper()
        
        return {
            'Rainfall': input_data['rainfall'],
            'Inflation_Rate': input_data['inflation_rate'],
            'Is_Seasonal': 1 if seasonality == 'yes' else 0,
            'Is_Non_Seasonal': 1 if seasonality == 'no' else 0,
            'Type_GR-1': 1 if price_type == 'GR1' else 0,
            'Type_GR-2': 1 if price_type == 'GR2' else 0,
            'Type_White': 1 if price_type == 'WHITE' else 0
        }