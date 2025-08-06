import tensorflow as tf
import numpy as np
from PIL import Image
import io
import os

class DeficiencyPredictionService:
    def __init__(self):
        self.model = None
        self.classes = ['Calcium', 'Heathly', 'Magnesium', 'Potasium']
        self.model_path = 'models/DiseaseIdentification.keras'
        
    def load_model(self):
        """Load the model if not already loaded"""
        if self.model is None:
            if not os.path.exists(self.model_path):
                raise FileNotFoundError(f"Model file not found at {self.model_path}")
            self.model = tf.keras.models.load_model(self.model_path)
        return self.model
    
    def prepare_image(self, image_bytes):
        """Prepare image for prediction"""
        try:
            # Open the image file using Pillow
            img = Image.open(io.BytesIO(image_bytes))
            
            # Convert to RGB if necessary
            if img.mode != 'RGB':
                img = img.convert('RGB')
            
            # Resize the image to 64x64 (based on your model input size)
            img = img.resize((64, 64))
            
            # Convert the image to a numpy array and normalize it
            img_array = np.array(img) / 255.0  # normalize to 0-1 range
            
            # Expand dimensions to add batch size (1)
            img_array = np.expand_dims(img_array, axis=0)
            
            return img_array
        except Exception as e:
            raise ValueError(f"Error processing image: {str(e)}")
    
    def suggest_fertilizer(self, deficiency, age):
        """Suggest fertilizers based on deficiency type and plant age"""
        
        fertilizer_recommendations = {
            'Potasium': {
                'below_1y': [
                    {
                        "fertilizer": "Potassium sulfate (K₂SO₄) dissolved in water and applied as a soil drench",
                        "dose": "5g - 10g",
                        "type": "Chemical",
                    },
                    {
                        "fertilizer": "Muriate of Potash (KCl)",
                        "dose": "5g - 10g",
                        "type": "Chemical",
                    },
                    {
                        "fertilizer": "Banana peel compost",
                        "dose": "250g-300g",
                        "type": "Natural",
                    },
                    {
                        "fertilizer": "Wood ash",
                        "dose": "100g",
                        "type": "Natural",
                    }
                ],
                '1_3y': [
                    {
                        "fertilizer": "Potassium sulfate (K₂SO₄) dissolved in water and applied as a soil drench",
                        "dose": "10g - 20g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Muriate of Potash (KCl)",
                        "dose": "10g - 15g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Banana peel compost",
                        "dose": "300g-400g",
                        "type": "Natural"
                    },
                    {
                        "fertilizer": "Wood ash",
                        "dose": "150g",
                        "type": "Natural"
                    }
                ],
                'above_3y': [
                    {
                        "fertilizer": "Potassium sulfate (K₂SO₄) dissolved in water and applied as a soil drench",
                        "dose": "20g - 30g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Muriate of Potash (KCl)",
                        "dose": "15g - 20g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Banana peel compost",
                        "dose": "500g",
                        "type": "Natural"
                    },
                    {
                        "fertilizer": "Wood ash",
                        "dose": "200g",
                        "type": "Natural"
                    }
                ]
            },
            'Calcium': {
                'below_1y': [
                    {
                        "fertilizer": "Calcium nitrate (Ca(NO₃)₂)",
                        "dose": "5g - 10g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Gypsum (CaSO₄)",
                        "dose": "10g - 15g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Crushed eggshells",
                        "dose": "50g - 100g",
                        "type": "Natural"
                    },
                    {
                        "fertilizer": "Lime water",
                        "dose": "100ml",
                        "type": "Natural"
                    }
                ],
                '1_3y': [
                    {
                        "fertilizer": "Calcium nitrate (Ca(NO₃)₂)",
                        "dose": "10g - 15g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Gypsum (CaSO₄)",
                        "dose": "15g - 20g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Crushed eggshells",
                        "dose": "100g - 150g",
                        "type": "Natural"
                    },
                    {
                        "fertilizer": "Lime water",
                        "dose": "150ml",
                        "type": "Natural"
                    }
                ],
                'above_3y': [
                    {
                        "fertilizer": "Calcium nitrate (Ca(NO₃)₂)",
                        "dose": "15g - 20g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Gypsum (CaSO₄)",
                        "dose": "20g - 30g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Crushed eggshells",
                        "dose": "150g - 200g",
                        "type": "Natural"
                    },
                    {
                        "fertilizer": "Lime water",
                        "dose": "200ml",
                        "type": "Natural"
                    }
                ]
            },
            'Magnesium': {
                'below_1y': [
                    {
                        "fertilizer": "Epsom Salt (Magnesium sulfate)",
                        "dose": "5g - 10g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Onion/Garlic skins",
                        "dose": "50g - 100g",
                        "type": "Natural"
                    }
                ],
                '1_3y': [
                    {
                        "fertilizer": "Epsom Salt (Magnesium sulfate)",
                        "dose": "10g - 15g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Onion/Garlic skins",
                        "dose": "100g - 150g",
                        "type": "Natural"
                    }
                ],
                'above_3y': [
                    {
                        "fertilizer": "Epsom Salt (Magnesium sulfate)",
                        "dose": "15g - 20g",
                        "type": "Chemical"
                    },
                    {
                        "fertilizer": "Onion/Garlic skins",
                        "dose": "150g - 200g",
                        "type": "Natural"
                    }
                ]
            }
        }
        
        # Determine age category
        if age <= 1:
            age_category = 'below_1y'
        elif 1 < age < 3:
            age_category = '1_3y'
        else:
            age_category = 'above_3y'
        
        return fertilizer_recommendations.get(deficiency, {}).get(age_category, [])
    
    def predict_deficiency(self, image_bytes, age):
        """Main prediction function"""
        try:
            # Load model
            model = self.load_model()
            
            # Prepare image
            img_array = self.prepare_image(image_bytes)
            
            # Get predictions from the model
            predictions = model.predict(img_array)
            
            # Get predicted class
            predicted_class_idx = np.argmax(predictions, axis=1)[0]
            deficiency = self.classes[predicted_class_idx]
            confidence = float(np.max(predictions))
            
            # Prepare result
            result = {
                'predicted_class': deficiency,
                'confidence': confidence,
                'confidence_percentage': round(confidence * 100, 2)
            }
            
            # Add fertilizer recommendations if deficiency is detected
            if deficiency != "Heathly":
                fertilizers = self.suggest_fertilizer(deficiency, age)
                result['fertilizers'] = fertilizers
                result['recommendation_count'] = len(fertilizers)
            else:
                result['message'] = 'Plant appears healthy. No fertilizer recommendations needed.'
            
            return result
            
        except Exception as e:
            raise Exception(f"Error during prediction: {str(e)}")