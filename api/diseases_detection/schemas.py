from marshmallow import Schema, fields, validate

class DiseaseDetectionResponseSchema(Schema):
    """
    Schema for disease detection API response
    """
    disease = fields.String(
        required=True,
        metadata={"description": "Predicted disease name"}
    )
    confidence = fields.Float(
        required=True,
        metadata={"description": "Confidence score of prediction"}
    )
    treatment = fields.String(
        required=True,
        metadata={"description": "Treatment recommendation"}
    )

class ErrorResponseSchema(Schema):
    """
    Schema for error responses
    """
    error = fields.String(
        required=True,
        metadata={"description": "Error message"}
    )

class FileUploadSchema(Schema):
    """
    Schema for file upload validation
    """
    file = fields.Raw(
        required=True,
        metadata={"description": "Image file for disease detection"}
    )
    
    class Meta:
        strict = True

class HealthCheckResponseSchema(Schema):
    """
    Schema for health check endpoint
    """
    status = fields.String(
        required=True,
        metadata={"description": "Service status"}
    )
    service = fields.String(
        required=False,
        metadata={"description": "Service name"}
    )
    message = fields.String(
        required=False,
        metadata={"description": "Additional status message"}
    )