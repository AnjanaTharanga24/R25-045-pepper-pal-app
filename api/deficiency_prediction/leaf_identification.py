# leaf_identification.py
import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

class LeafIdentificationService:
    def __init__(self):
        self.interpreter = None
        self.classes = [
            'Alstonia Scholaris', 'Arjun', 'Bael', 'Basil', 'Chinar', 
            'Gauva', 'Jamun', 'Jatropha', 'Lemon', 'Mango', 'NotLeaf', 
            'Pepper', 'Pomegranate', 'Pongamia Pinnata'
        ]
        self.model_path = 'models/leafIdentification.tflite'
        
    def load_model(self):
        """Load the TFLite model if not already loaded"""
        if self.interpreter is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            self.interpreter = tf.lite.Interpreter(model_path=self.model_path)
            self.interpreter.allocate_tensors()
        return self.interpreter
    
    def prepare_image(self, image_bytes):
        """Prepare image for prediction"""
        try:
            # Open the image file using Pillow
            img = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize the image to 64x64
            img = img.resize((64, 64))
            
            # Convert the image to a numpy array and normalize it
            img_array = np.array(img) / 255.0  # normalize to 0-1 range
            
            # Expand dimensions to add batch size (1)
            img_array = np.expand_dims(img_array, axis=0).astype(np.float32)
            
            return img_array
        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}")
    
    def predict_leaf_type(self, image_bytes):
        """Predict the type of leaf from image"""
        try:
            # Load model
            interpreter = self.load_model()
            
            # Get input and output details
            input_details = interpreter.get_input_details()
            output_details = interpreter.get_output_details()
            
            # Prepare image
            img_array = self.prepare_image(image_bytes)
            
            # Set input tensor and run inference
            interpreter.set_tensor(input_details[0]['index'], img_array)
            interpreter.invoke()
            
            # Get predictions
            predictions = interpreter.get_tensor(output_details[0]['index'])
            
            # Get predicted class and confidence
            predicted_class_idx = np.argmax(predictions, axis=1)[0]
            leaf_type = self.classes[predicted_class_idx]
            confidence = float(np.max(predictions))
            
            return {
                'predicted_class': leaf_type,
                'confidence': confidence
            }
            
        except Exception as e:
            raise Exception(f"Error during leaf identification: {str(e)}")