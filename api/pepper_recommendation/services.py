import os
import pandas as pd
import joblib
import warnings

warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

class ClimateDataFetcher:
    _df = None
    
    @classmethod
    def _load_data(cls):
        if cls._df is None:
            possible_paths = [
                'data/With_climate_data.csv',
                'With_climate_data.csv',
                'api/pepper_recommendation/data/With_climate_data.csv',
                'api/data/With_climate_data.csv',
                os.path.join(os.path.dirname(__file__), 'data', 'With_climate_data.csv'),
                os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'With_climate_data.csv')
            ]
            
            file_path = None
            for path in possible_paths:
                if os.path.exists(path):
                    file_path = path
                    break
            
            if file_path is None:
                raise FileNotFoundError(f"CSV file 'With_climate_data.csv' not found in any of these locations: {possible_paths}")
            
            try:
                cls._df = pd.read_csv(file_path)
            except Exception as e:
                raise FileNotFoundError(f"Error loading CSV file from '{file_path}': {str(e)}")
    
    @classmethod
    def get_climate_data(cls, district, ds_division):
        cls._load_data()
        result = cls._df[
            (cls._df['District'].str.strip().str.lower() == district.strip().lower()) &
            (cls._df['DS Division'].str.strip().str.lower() == ds_division.strip().lower())
        ]

        if result.empty:
            return None

        elevation = int(result['Elevation (m)'].values[0])
        rainfall = int(result['Annual Rainfall (mm)'].values[0])
        temperature = float(result['Avg Temperature (?C)'].values[0])
        humidity = int(result['Humidity (%)'].values[0])

        return {
            'Elevation (m)': elevation,
            'Annual Rainfall (mm)': rainfall,
            'Avg Temperature (°C)': temperature,
            'Humidity (%)': humidity
        }

    @classmethod
    def get_soil_data(cls, soil_type):
        cls._load_data()
        result = cls._df[
            (cls._df['Soil Texture Type'].str.strip().str.lower() == soil_type.strip().lower())
        ]

        if result.empty:
            return None

        soil_quality = result['Soil Quality'].values[0]
        drainage = result['Drainage'].values[0]

        return {
            'Soil Quality': soil_quality,
            'Drainage': drainage,
        }

class PepperRecommendationService:
    _model = None
    _label_encoders = None
    _categorical_features = ['Soil Texture Type', 'Soil Quality', 'Drainage']
    
    @classmethod
    def _load_models(cls):
        if cls._model is None or cls._label_encoders is None:
            possible_model_paths = [
                'models/recommendation_model.joblib',
                'recommendation_model.joblib',
                'api/pepper_recommendation/models/recommendation_model.joblib',
                'api/models/recommendation_model.joblib',
                os.path.join(os.path.dirname(__file__), 'models', 'recommendation_model.joblib'),
                os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'recommendation_model.joblib')
            ]
            
            possible_encoder_paths = [
                'models/label_encoders.joblib',
                'label_encoders.joblib',
                'api/pepper_recommendation/models/label_encoders.joblib',
                'api/models/label_encoders.joblib',
                os.path.join(os.path.dirname(__file__), 'models', 'label_encoders.joblib'),
                os.path.join(os.path.dirname(__file__), '..', '..', 'models', 'label_encoders.joblib')
            ]
            
            model_path = None
            for path in possible_model_paths:
                if os.path.exists(path):
                    model_path = path
                    break
            
            encoder_path = None
            for path in possible_encoder_paths:
                if os.path.exists(path):
                    encoder_path = path
                    break
            
            if model_path is None:
                raise FileNotFoundError(f"Model file 'recommendation_model.joblib' not found in any of these locations: {possible_model_paths}")
            
            if encoder_path is None:
                raise FileNotFoundError(f"Label encoders file 'label_encoders.joblib' not found in any of these locations: {possible_encoder_paths}")
            
            cls._model = joblib.load(model_path)
            cls._label_encoders = joblib.load(encoder_path)
    
    @classmethod
    def predict_pepper(cls, elevation, annual_rainfall, avg_temperature, humidity, 
                      soil_texture, soil_quality, drainage):
        cls._load_models()
        
        new_data = pd.DataFrame({
            'Elevation (m)': [elevation],
            'Annual Rainfall (mm)': [annual_rainfall],
            'Avg Temperature (?C)': [avg_temperature],
            'Humidity (%)': [humidity],
            'Soil Texture Type': [soil_texture],
            'Soil Quality': [soil_quality],
            'Drainage': [drainage]
        })

        for column in cls._categorical_features:
            if column in new_data.columns and column in cls._label_encoders:
                try:
                    if not hasattr(cls._label_encoders[column], 'classes_') or len(cls._label_encoders[column].classes_) == 0:
                        cls._label_encoders[column].fit(new_data[column])
                    new_data[column] = cls._label_encoders[column].transform(new_data[column])
                except ValueError as e:
                    raise ValueError(f"Value '{new_data[column].iloc[0]}' not found in the fitted label encoder for column: {column}")
            elif column in new_data.columns:
                raise ValueError(f"Label encoder not found for column: {column}")

        prediction = cls._model.predict(new_data)
        return prediction[0]

def predict_pepper(elevation, annual_rainfall, avg_temperature, humidity, 
                  soil_texture, soil_quality, drainage):
    return PepperRecommendationService.predict_pepper(
        elevation, annual_rainfall, avg_temperature, humidity, 
        soil_texture, soil_quality, drainage
    )

def get_climate_data(district, ds_division):
    return ClimateDataFetcher.get_climate_data(district, ds_division)

def get_soil_data(soil_type):
    return ClimateDataFetcher.get_soil_data(soil_type)