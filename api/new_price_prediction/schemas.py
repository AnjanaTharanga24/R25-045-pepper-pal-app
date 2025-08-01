from marshmallow import Schema, fields, validate, validates, ValidationError

class PricePredictionInputSchema(Schema):
    rainfall = fields.Float(required=True)
    price_type = fields.Str(
        required=True,
        validate=validate.OneOf(['GR1', 'GR2', 'WHITE'])
    )
    inflation_rate = fields.Float(required=True)
    seasonality = fields.Str(
        required=True,
        validate=validate.OneOf(['YES', 'NO'])
    )

    @validates('rainfall')
    def validate_rainfall(self, value):
        if value < 0:
            raise ValidationError("Rainfall must be positive")

    @validates('inflation_rate')
    def validate_inflation_rate(self, value):
        if abs(value) > 100:
            raise ValidationError("Inflation rate seems unrealistic")