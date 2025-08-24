import os
import pickle
import pandas as pd
import numpy as np
from pathlib import Path
from datetime import datetime
from tensorflow.keras.models import load_model
from sklearn.exceptions import InconsistentVersionWarning
import warnings

warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

loaded_district_models = {}
district_latest_data = {}

def get_district_model(district):
    """Get cached district model or load it"""
    if district not in loaded_district_models:
        model = load_district_model(district)
        loaded_district_models[district] = model
    return loaded_district_models[district]

def load_district_model(district):
    """Load district model components from pickle files"""
    current_dir = Path(__file__).parent
    model_dir = current_dir / "district_models" / district
    
    if not model_dir.exists():
        raise FileNotFoundError(f"No model directory found for {district}")
    
    try:
        with open(model_dir / "model_components.pkl", "rb") as f:
            components = pickle.load(f)
        
        model = load_model(model_dir / "lstm_model.h5")
        
        data_path = model_dir / "latest_data.csv"
        if data_path.exists():
            data = pd.read_csv(data_path)
            data['Date'] = pd.to_datetime(data['Date'])
            district_latest_data[district] = data
        
        return {
            "model": model,
            "scaler": components['scaler'],
            "params": components['params'],
            "accuracy": components['accuracy'],
            "model_type": "LSTM"
        }
    except Exception as e:
        raise RuntimeError(f"Error loading {district} model: {str(e)}")

def predict_district_price(district, target_date):
    """Make district price prediction for GR-1 pepper"""
    try:
        model_info = get_district_model(district)
        target_date = pd.to_datetime(target_date)
        
        if district not in district_latest_data:
            raise ValueError(f"No data available for {district}")
            
        type_data = district_latest_data[district]
        last_date = type_data['Date'].max()
        
        if target_date <= last_date:
            raise ValueError(f"Date must be after {last_date.strftime('%Y-%m-%d')}")
        
        steps = (target_date.year - last_date.year) * 12 + (target_date.month - last_date.month)

        scaler = model_info['scaler']
        seq_length = model_info['params']['seq_length']
        scaled_data = scaler.transform(type_data[['GR-1 - Price']].values)
        last_sequence = scaled_data[-seq_length:].reshape(1, seq_length, 1)
        
        current_sequence = last_sequence.copy()
        for _ in range(steps):
            next_pred = model_info['model'].predict(current_sequence, verbose=0)
            current_sequence = np.roll(current_sequence, -1, axis=1)
            current_sequence[0, -1, 0] = next_pred[0,0]
        
        predicted_price = float(scaler.inverse_transform(next_pred)[0,0])
        
        return {
            "district": district,
            "target_date": target_date.strftime("%Y-%m-%d"),
            "predicted_price": round(predicted_price, 2),
            "model_accuracy": round(model_info['accuracy'], 2),
            "model_type": model_info['model_type']
        }
        
    except Exception as e:
        raise RuntimeError(f"District prediction failed: {str(e)}")

def get_available_districts():
    """List all available districts with models"""
    current_dir = Path(__file__).parent
    models_dir = current_dir / "district_models"
    
    if not models_dir.exists():
        return []
    
    return [d.name for d in models_dir.iterdir() if d.is_dir()]

def get_district_history(district):
    """Get historical price data for a district"""
    if district not in district_latest_data:
        try:
            current_dir = Path(__file__).parent
            data_path = current_dir / "district_models" / district / "latest_data.csv"
            if data_path.exists():
                data = pd.read_csv(data_path)
                data['Date'] = pd.to_datetime(data['Date'])
                district_latest_data[district] = data
            else:
                raise FileNotFoundError(f"No data file found for {district}")
        except Exception as e:
            raise ValueError(f"Could not load history for {district}: {str(e)}")
    
    history = district_latest_data[district][['Date', 'GR-1 - Price']].copy()
    history.columns = ['date', 'price']
    return history.to_dict('records')