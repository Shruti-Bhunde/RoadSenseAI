import os
import joblib
import pandas as pd
import numpy as np

class TrafficPredictor:
    def __init__(self, model_path='ml/models/traffic_model.joblib'):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at {model_path}. Please run train.py first.")
        
        self.payload = joblib.load(model_path)
        self.model = self.payload['model']
        self.weather_encoder = self.payload['weather_encoder']
        self.road_type_encoder = self.payload['road_type_encoder']
        self.target_encoder = self.payload['target_encoder']
        
    def predict(self, weather: str, road_type: str, traffic_density: float, visibility: float, num_lanes: int, hour: int) -> str:
        # Standardize strings for lookup
        weather = weather.capitalize() if weather else "Sunny"
        road_type = road_type.capitalize() if road_type else "Local"
        
        # Enforce valid category fallback
        if weather not in self.weather_encoder.classes_:
            weather = 'Sunny'
        if road_type not in self.road_type_encoder.classes_:
            road_type = 'Local'
            
        # Encode values
        weather_encoded = self.weather_encoder.transform([weather])[0]
        road_type_encoded = self.road_type_encoder.transform([road_type])[0]
        
        # Build features DataFrame
        features = pd.DataFrame([{
            'weather_encoded': weather_encoded,
            'road_type_encoded': road_type_encoded,
            'traffic_density': float(traffic_density),
            'visibility': float(visibility),
            'num_lanes': int(num_lanes),
            'hour': int(hour)
        }])
        
        # Predict
        pred_encoded = self.model.predict(features)[0]
        return self.target_encoder.inverse_transform([pred_encoded])[0]

if __name__ == "__main__":
    predictor = TrafficPredictor()
    result = predictor.predict('Rainy', 'Highway', 0.8, 0.3, 2, 8)
    print(f"Test prediction (Rainy, Highway, 0.8, 0.3, 2, 8): {result}")
