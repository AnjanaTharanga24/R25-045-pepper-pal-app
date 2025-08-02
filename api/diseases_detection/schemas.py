from marshmallow import Schema, fields, validate

class DiseaseDetectionResponseSchema(Schema):
    disease = fields.String(required=True, description="Predicted disease name")
    confidence = fields.Float(required=True, description="Confidence score of prediction")
    treatment = fields.String(required=True, description="Treatment recommendation")

class ErrorResponseSchema(Schema):
    error = fields.String(required=True, description="Error message")

# File validation schema
class FileUploadSchema(Schema):
    file = fields.Raw(required=True, description="Image file for disease detection")
    
    class Meta:
        strict = True