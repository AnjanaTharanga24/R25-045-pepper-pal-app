import os
import tensorflow as tf
import gdown
import numpy as np
from PIL import Image
import scipy.stats  # for entropy calculation

class DiseaseDetectionModel:
    def __init__(self):
        self.model_path = 'pickle_models/pepper_model.tflite'
        self.file_id = '1YnDz5wccNoRVV4aepFBmCI0F-geBQWXe'
        self.download_url = f'https://drive.google.com/uc?id={self.file_id}'
        self.interpreter = None
        self.input_details = None
        self.output_details = None
        
        # Class labels
        self.class_names = [
            'Healthy', 
            'Lace Bug Infection', 
            'Vine borer Infection', 
            'Yellow Mottle Infection'
        ]
        
        # Treatment recommendations
        self.treatments = {
            'Healthy': 'No treatment needed.',
            'Lace Bug Infection': 'Spray neem oil or insecticidal soap every 7 days.',
            'Vine borer Infection': 'Use pheromone traps or apply biological control methods.',
            'Yellow Mottle Infection': 'Apply recommended fungicides and improve soil drainage.'
        }
        
        self._load_model()
    
    def _download_model(self):
        """Download model from Google Drive if not present"""
        os.makedirs('pickle_models', exist_ok=True)
        if not os.path.exists(self.model_path):
            print("Downloading model from Google Drive...")
            gdown.download(self.download_url, self.model_path, quiet=False)
    
    def _load_model(self):
        """Load the TFLite model"""
        self._download_model()
        
        self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
        self.interpreter.allocate_tensors()
        
        self.input_details = self.interpreter.get_input_details()
        self.output_details = self.interpreter.get_output_details()
    
    def preprocess_image(self, image_path):
        """Preprocess image for model input"""
        img = Image.open(image_path).resize((244, 244)).convert('RGB')
        img_array = np.array(img).astype(np.float32) / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        return img_array
    
    def predict(self, image_path):
        """Make prediction on image"""
        try:
            # Preprocess image
            img_array = self.preprocess_image(image_path)
            
            # Run inference
            self.interpreter.set_tensor(self.input_details[0]['index'], img_array)
            self.interpreter.invoke()
            
            # Get results
            output_data = self.interpreter.get_tensor(self.output_details[0]['index'])
            confidence = float(np.max(output_data))
            predicted_index = int(np.argmax(output_data))
            predicted_label = self.class_names[predicted_index]

            # --- NEW: Entropy calculation ---
            entropy = float(scipy.stats.entropy(output_data[0]))

            # --- NEW: Reject overconfident low-entropy predictions ---
            if confidence > 0.95 and entropy < 0.5:
                raise ValueError("This image does not appear to be a valid pepper leaf. Please upload a proper leaf image.")

            return {
                'disease': predicted_label,
                'confidence': round(confidence, 4),
                'entropy': round(entropy, 4),  # NEW field
                'treatment': self.treatments.get(predicted_label, "No treatment recommendation available.")
            }
            
        except Exception as e:
            raise Exception(f'Failed to process image: {str(e)}')
