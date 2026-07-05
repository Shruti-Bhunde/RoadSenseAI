import os
import sys
from datetime import datetime

# Add parent workspace path to sys.path to import from the sibling ml module
workspace_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if workspace_dir not in sys.path:
    sys.path.append(workspace_dir)


from ml.predict import TrafficPredictor

class MLService:
    def __init__(self):
        model_path = os.path.join(workspace_dir, 'ml', 'models', 'traffic_model.joblib')
        if os.path.exists(model_path):
            self.predictor = TrafficPredictor(model_path)
            self.model_loaded = True
            print("Random Forest Traffic Model loaded successfully.")
        else:
            self.predictor = None
            self.model_loaded = False
            print(f"Warning: ML model file not found at {model_path}. Predictor will run with rules fallback.")

    def predict_traffic_impact(self, weather: str, road_type: str, traffic_density: float, visibility: float, num_lanes: int, hour: int = None) -> str:
        """
        Runs ML prediction to classify traffic impact as Low, Medium, or High.
        """
        if hour is None:
            hour = datetime.now().hour

        if self.model_loaded and self.predictor:
            try:
                return self.predictor.predict(
                    weather=weather,
                    road_type=road_type,
                    traffic_density=traffic_density,
                    visibility=visibility,
                    num_lanes=num_lanes,
                    hour=hour
                )
            except Exception as e:
                print(f"ML model prediction error: {e}. Falling back to rule-based classification.")
                
        # Rule-based fallback if ML model is not loaded or errors out
        score = traffic_density * 5
        if weather in ['Rainy', 'Foggy']:
            score += 1.5
        elif weather == 'Snowy':
            score += 2.0
            
        if visibility < 0.4:
            score += 1.5
            
        if num_lanes == 1:
            score += 1.5
        elif num_lanes == 2:
            score += 0.7
            
        if (7 <= hour <= 9) or (16 <= hour <= 19):
            score += 1.5
            
        if road_type == 'Highway':
            score += 0.5

        if score < 4.0:
            return 'Low'
        elif score < 7.0:
            return 'Medium'
        else:
            return 'High'
