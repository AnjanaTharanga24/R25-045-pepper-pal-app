from marshmallow import Schema, fields

class DistrictPredictionRequestSchema(Schema):
    district = fields.Str(required=True)
    target_date = fields.Str(required=True)

class DistrictPredictionResponseSchema(Schema):
    district = fields.Str()
    target_date = fields.Str()
    predicted_price = fields.Float()
    model_accuracy = fields.Float()
    model_type = fields.Str()