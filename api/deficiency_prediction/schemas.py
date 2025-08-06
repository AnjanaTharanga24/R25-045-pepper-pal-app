from marshmallow import Schema, fields, validate

class DeficiencyPredictionRequestSchema(Schema):
    """Schema for deficiency prediction request validation"""
    age = fields.Integer(
        required=True,
        validate=validate.Range(min=0, max=50),
        error_messages={
            'required': 'Age is required',
            'invalid': 'Age must be a valid integer',
            'validator_failed': 'Age must be between 0 and 50 years'
        }
    )

class FertilizerRecommendationSchema(Schema):
    """Schema for fertilizer recommendation"""
    fertilizer = fields.String(required=True)
    dose = fields.String(required=True)
    type = fields.String(required=True, validate=validate.OneOf(['Chemical', 'Natural']))

class DeficiencyPredictionResponseSchema(Schema):
    """Schema for deficiency prediction response"""
    status = fields.String(required=True)
    data = fields.Nested('DeficiencyResultSchema', required=True)

class DeficiencyResultSchema(Schema):
    """Schema for deficiency prediction result"""
    predicted_class = fields.String(
        required=True,
        validate=validate.OneOf(['Calcium', 'Heathly', 'Magnesium', 'Potasium'])
    )
    confidence = fields.Float(required=True, validate=validate.Range(min=0, max=1))
    confidence_percentage = fields.Float(required=True, validate=validate.Range(min=0, max=100))
    fertilizers = fields.List(fields.Nested(FertilizerRecommendationSchema), missing=[])
    recommendation_count = fields.Integer(missing=0)
    message = fields.String(missing=None)

class ErrorResponseSchema(Schema):
    """Schema for error responses"""
    status = fields.String(required=True, validate=validate.Equal('error'))
    message = fields.String(required=True)