import os
from werkzeug.utils import secure_filename
from .models import DiseaseDetectionModel

class DiseaseDetectionService:
    def __init__(self):
        self.model = DiseaseDetectionModel()
        self.upload_folder = 'uploads'
        self.allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}
        
        os.makedirs(self.upload_folder, exist_ok=True)
    
    def allowed_file(self, filename):
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in self.allowed_extensions
    
    def save_uploaded_file(self, file):
        if file and self.allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(self.upload_folder, filename)
            file.save(file_path)
            return file_path
        else:
            raise ValueError("Invalid file type. Please upload an image file.")
    
    def predict_disease(self, file):
        try:
            file_path = self.save_uploaded_file(file)
            result = self.model.predict(file_path)
            if os.path.exists(file_path):
                os.remove(file_path)
            return result
        except Exception as e:
            if 'file_path' in locals() and os.path.exists(file_path):
                os.remove(file_path)
            raise e
