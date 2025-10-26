import pandas as pd
import numpy as np
from pathlib import Path
import pickle
from tensorflow.keras.models import load_model

def debug_prediction_difference(district="Ratnapura", target_date="2025-08-30"):
    """Debug script to find why predictions differ between Jupyter and Flask"""
    
    print(f"🔍 Debugging prediction for {district} on {target_date}")
    print("=" * 60)
    
    # Load model components
    current_dir = Path(__file__).parent
    model_dir = current_dir / "api" / "district_prediction" / "district_models" / district
    
    # Load components
    with open(model_dir / "model_components.pkl", "rb") as f:
        components = pickle.load(f)
    
    # Load model
    model = load_model(model_dir / "lstm_model.h5")
    
    # Load data
    data = pd.read_csv(model_dir / "latest_data.csv")
    data['Date'] = pd.to_datetime(data['Date'])
    
    print(f"📊 Data Info:")
    print(f"   - Data shape: {data.shape}")
    print(f"   - Date range: {data['Date'].min()} to {data['Date'].max()}")
    print(f"   - Last date: {data['Date'].max()}")
    print(f"   - Columns: {list(data.columns)}")
    
    # Check scaler
    scaler = components['scaler']
    print(f"\n🔧 Scaler Info:")
    print(f"   - Scaler type: {type(scaler)}")
    print(f"   - Scaler mean: {scaler.mean_[0] if hasattr(scaler, 'mean_') else 'N/A'}")
    print(f"   - Scaler scale: {scaler.scale_[0] if hasattr(scaler, 'scale_') else 'N/A'}")
    
    # Check parameters
    params = components['params']
    seq_length = params['seq_length']
    print(f"\n⚙️ Model Parameters:")
    print(f"   - Sequence length: {seq_length}")
    print(f"   - Model accuracy: {components['accuracy']}")
    
    # Prepare prediction data (step by step)
    target_date = pd.to_datetime(target_date)
    last_date = data['Date'].max()
    steps = (target_date.year - last_date.year) * 12 + (target_date.month - last_date.month)
    
    print(f"\n📅 Date Calculation:")
    print(f"   - Last date: {last_date}")
    print(f"   - Target date: {target_date}")
    print(f"   - Prediction steps: {steps}")
    
    # Get price data
    price_data = data[['GR-1 - Price']].values
    print(f"\n💰 Price Data:")
    print(f"   - Price data shape: {price_data.shape}")
    print(f"   - Last 5 prices: {price_data[-5:].flatten()}")
    print(f"   - Min price: {price_data.min()}")
    print(f"   - Max price: {price_data.max()}")
    
    # Scale data
    scaled_data = scaler.transform(price_data)
    print(f"\n📏 Scaled Data:")
    print(f"   - Scaled data shape: {scaled_data.shape}")
    print(f"   - Last 5 scaled: {scaled_data[-5:].flatten()}")
    print(f"   - Min scaled: {scaled_data.min()}")
    print(f"   - Max scaled: {scaled_data.max()}")
    
    # Prepare sequence
    last_sequence = scaled_data[-seq_length:].reshape(1, seq_length, 1)
    print(f"\n🔢 Sequence Info:")
    print(f"   - Sequence shape: {last_sequence.shape}")
    print(f"   - Sequence values: {last_sequence[0, :, 0]}")
    
    # Make prediction step by step
    current_sequence = last_sequence.copy()
    predictions = []
    
    print(f"\n🎯 Prediction Steps:")
    for step in range(steps):
        next_pred = model.predict(current_sequence, verbose=0)
        predictions.append(next_pred[0, 0])
        print(f"   Step {step + 1}: {next_pred[0, 0]} (scaled)")
        
        # Update sequence
        current_sequence = np.roll(current_sequence, -1, axis=1)
        current_sequence[0, -1, 0] = next_pred[0, 0]
    
    # Final prediction
    final_scaled = predictions[-1] if predictions else model.predict(current_sequence, verbose=0)[0, 0]
    final_prediction = scaler.inverse_transform([[final_scaled]])[0, 0]
    
    print(f"\n🎯 Final Results:")
    print(f"   - Final scaled prediction: {final_scaled}")
    print(f"   - Final price prediction: {final_prediction}")
    print(f"   - Rounded prediction: {round(final_prediction, 2)}")
    
    # Compare with your Jupyter result
    jupyter_result = 1805.286865234375
    difference = abs(final_prediction - jupyter_result)
    percentage_diff = (difference / jupyter_result) * 100
    
    print(f"\n📊 Comparison:")
    print(f"   - This result: {final_prediction}")
    print(f"   - Jupyter result: {jupyter_result}")
    print(f"   - Difference: {difference}")
    print(f"   - Percentage diff: {percentage_diff:.4f}%")
    
    return {
        "prediction": final_prediction,
        "rounded": round(final_prediction, 2),
        "steps": steps,
        "sequence_length": seq_length,
        "difference_from_jupyter": difference
    }

if __name__ == "__main__":
    result = debug_prediction_difference()
    print(f"\n✅ Debug complete. Result: {result}")