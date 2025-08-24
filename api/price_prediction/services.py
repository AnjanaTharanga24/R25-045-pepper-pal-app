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

loaded_models = {}
latest_data = {}

def load_model_pickle(pepper_type):
    """Load model components from pickle files"""
    current_dir = Path(__file__).parent
    model_dir = current_dir / "pickle_models" / pepper_type
    
    if not model_dir.exists():
        raise FileNotFoundError(f"No model directory found for {pepper_type}")
    
    try:
        with open(model_dir / "model_components.pkl", "rb") as f:
            components = pickle.load(f)
        
        model = load_model(model_dir / "lstm_model.h5")
    
        data_path = model_dir / "latest_data.csv"
        if data_path.exists():
            data = pd.read_csv(data_path)
            data['Date'] = pd.to_datetime(data['Date'])
            latest_data[pepper_type] = data
        
        return {
            'model': model,
            'scaler': components['scaler'],
            'params': components['params'],
            'accuracy': components['accuracy']
        }
    except Exception as e:
        raise RuntimeError(f"Error loading {pepper_type} model: {str(e)}")

def get_model(pepper_type):
    """Get cached model or load it"""
    if pepper_type not in loaded_models:
        model = load_model_pickle(pepper_type)
        loaded_models[pepper_type] = model
    return loaded_models[pepper_type]

def predict_price(pepper_type, target_date):
    """Make price prediction"""
    try:
        model_info = get_model(pepper_type)
        target_date = pd.to_datetime(target_date)
        
        if pepper_type not in latest_data:
            raise ValueError(f"No data available for {pepper_type}")
            
        type_data = latest_data[pepper_type]
        last_date = type_data['Date'].max()
        
        if target_date <= last_date:
            raise ValueError(f"Date must be after {last_date.strftime('%Y-%m-%d')}")
        
        steps = (target_date.year - last_date.year) * 12 + (target_date.month - last_date.month)
        
        scaler = model_info['scaler']
        seq_length = model_info['params']['seq_length']
        scaled_data = scaler.transform(type_data[['National_Price']].values)
        last_sequence = scaled_data[-seq_length:].reshape(1, seq_length, 1)
        
        current_sequence = last_sequence.copy()
        for _ in range(steps):
            next_pred = model_info['model'].predict(current_sequence, verbose=0)
            current_sequence = np.roll(current_sequence, -1, axis=1)
            current_sequence[0, -1, 0] = next_pred[0,0]
        
        predicted_price = float(scaler.inverse_transform(next_pred)[0,0])
        
        return {
            "pepper_type": pepper_type,
            "target_date": target_date.strftime("%Y-%m-%d"),
            "predicted_price": round(predicted_price, 2),
            "model_accuracy": round(model_info['accuracy'], 2)
        }
        
    except Exception as e:
        raise RuntimeError(f"Prediction failed: {str(e)}")