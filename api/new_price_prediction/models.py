from catboost import CatBoostRegressor
import os

class PricePredictionModel:
    def __init__(self):
        self.model = None
        self.columns_order = [
            'Rainfall', 'Inflation_Rate', 'Is_Seasonal', 'Is_Non_Seasonal',
            'Type_GR-1', 'Type_GR-2', 'Type_White'
        ]
    
    def load_model(self, model_path):
        """Load the trained CatBoost model"""
        self.model = CatBoostRegressor()
        self.model.load_model(model_path)
        return self