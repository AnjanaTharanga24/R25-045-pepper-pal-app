from marshmallow import Schema, fields

class PredictionRequestSchema(Schema):
    pepper_type = fields.Str(required=True)
    target_date = fields.Str(required=True)

class PredictionResponseSchema(Schema):
    pepper_type = fields.Str()
    target_date = fields.Str()
    predicted_price = fields.Float()
    model_accuracy = fields.Float()

class HistoryItemSchema(Schema):
    date = fields.Str()
    price = fields.Float()

class HistoryResponseSchema(Schema):
    pepper_type = fields.Str()
    history = fields.List(fields.Nested(HistoryItemSchema))

class ModelInfoSchema(Schema):
    accuracy = fields.Float()
    parameters = fields.Dict()

class ModelsResponseSchema(Schema):
    available_models = fields.List(fields.Str())
    models_info = fields.Dict(keys=fields.Str(), values=fields.Nested(ModelInfoSchema))