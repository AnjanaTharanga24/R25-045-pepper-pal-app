from marshmallow import Schema, fields, validate, validates_schema, ValidationError

class PricePredictionInputSchema(Schema):
    rainfall = fields.Float(required=True)
    price_type = fields.String(
        required=True,
        validate=validate.OneOf(['GR1', 'GR2', 'WHITE'])
    )
    inflation_rate = fields.Float(required=True)
    seasonality = fields.String(
        required=True,
        validate=validate.OneOf(['YES', 'NO'])
    )

    @validates_schema
    def validate_fields(self, data, **kwargs):
        """Validate all fields at once"""
        if data.get('rainfall') < 0:
            raise ValidationError("Rainfall must be positive", field_name="rainfall")
        
        if abs(data.get('inflation_rate')) > 100:
            raise ValidationError("Inflation rate seems unrealistic", field_name="inflation_rate")