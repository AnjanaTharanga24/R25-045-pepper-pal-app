import pandas as pd
import os

class ClimateDataFetcher:
    def __init__(self, file_path='data/With_climate_data.csv'):
        self.file_path = file_path
        self.df = None
        self.load_data()
    
    def load_data(self):
        try:
            if os.path.exists(self.file_path):
                self.df = pd.read_csv(self.file_path)
            else:
                raise FileNotFoundError(f"Climate data file not found at '{self.file_path}'")
        except Exception as e:
            raise Exception(f"Error loading climate data: {str(e)}")
    
    def get_climate_data(self, district, ds_division):
        if self.df is None:
            return {"error": "Climate data not loaded"}
        
        result = self.df[
            (self.df['District'].str.strip().str.lower() == district.strip().lower()) &
            (self.df['DS Division'].str.strip().str.lower() == ds_division.strip().lower())
        ]

        if result.empty:
            return {"error": f"No climate data found for {district} - {ds_division}"}

        try:
            elevation = int(result['Elevation (m)'].values[0])
            rainfall = int(result['Annual Rainfall (mm)'].values[0])
            temperature = float(result['Avg Temperature (?C)'].values[0])
            humidity = int(result['Humidity (%)'].values[0])

            return {
                'success': True,
                'data': {
                    'elevation': elevation,
                    'annual_rainfall': rainfall,
                    'avg_temperature': temperature,
                    'humidity': humidity,
                    'district': district,
                    'ds_division': ds_division
                }
            }
        except Exception as e:
            return {"error": f"Error processing climate data: {str(e)}"}

    def get_soil_data(self, soil_type):
        if self.df is None:
            return {"error": "Climate data not loaded"}
        
        result = self.df[
            (self.df['Soil Texture Type'].str.strip().str.lower() == soil_type.strip().lower())
        ]

        if result.empty:
            return {"error": f"No soil data found for {soil_type}"}

        try:
            soil_quality = result['Soil Quality'].values[0]
            drainage = result['Drainage'].values[0]

            return {
                'success': True,
                'data': {
                    'soil_quality': soil_quality,
                    'drainage': drainage,
                    'soil_texture': soil_type
                }
            }
        except Exception as e:
            return {"error": f"Error processing soil data: {str(e)}"}
    
    def get_districts(self):
        if self.df is None:
            return {"error": "Climate data not loaded"}
        
        try:
            districts = sorted(self.df['District'].str.strip().unique().tolist())
            return {
                'success': True,
                'districts': districts
            }
        except Exception as e:
            return {"error": f"Error getting districts: {str(e)}"}
    
    def get_ds_divisions(self, district):
        if self.df is None:
            return {"error": "Climate data not loaded"}
        
        try:
            district_data = self.df[
                self.df['District'].str.strip().str.lower() == district.strip().lower()
            ]
            
            if district_data.empty:
                return {"error": f"No data found for district: {district}"}
            
            ds_divisions = sorted(district_data['DS Division'].str.strip().unique().tolist())
            return {
                'success': True,
                'ds_divisions': ds_divisions,
                'district': district
            }
        except Exception as e:
            return {"error": f"Error getting DS divisions: {str(e)}"}
    
    def get_soil_types(self):
        if self.df is None:
            return {"error": "Climate data not loaded"}
        
        try:
            soil_types = sorted(self.df['Soil Texture Type'].str.strip().unique().tolist())
            return {
                'success': True,
                'soil_types': soil_types
            }
        except Exception as e:
            return {"error": f"Error getting soil types: {str(e)}"}