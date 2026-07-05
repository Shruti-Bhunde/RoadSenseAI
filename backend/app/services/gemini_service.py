import os
import json
from google.genai import Client
from app.config.settings import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = Client(api_key=self.api_key if self.api_key else None)
        # Using a supported Gemini model available in this environment
        self.model_name = "models/gemini-2.5-flash"

    def analyze_incident(self, file_path: str = None, mime_type: str = None, text_content: str = None) -> dict:
        """
        Analyzes the incident report (text or media file) using Gemini 1.5 Flash.
        Returns a structured JSON response.
        """
        if not self.api_key:
            # Fallback mock response for testing/development if API key is not provided
            return self._get_fallback_mock_response(text_content or "Unstructured incident report")

        prompt = """
        You are an expert AI system for traffic operations and incident response.
        Analyze the provided traffic incident report (which may be text, image, audio, or video).
        
        Extract the following details as structured JSON:
        1. "incident_type": The type of incident (e.g., Accident, Road Construction, Vehicle Breakdown, Road Hazard, Flooding, Traffic Jam).
        2. "severity": The severity of the incident. Must be exactly one of: "Low", "Medium", "High".
        3. "latitude": Estimated latitude coordinate of the incident. If not visible/mentioned, estimate based on context or return 12.9716.
        4. "longitude": Estimated longitude coordinate of the incident. If not visible/mentioned, estimate based on context or return 77.5946.
        5. "confidence": A float value between 0.0 and 1.0 indicating your confidence in this analysis.
        6. "summary": A brief, professional, 1-2 sentence summary of what happened.
        7. "weather": The weather conditions. Must be exactly one of: "Sunny", "Rainy", "Foggy", "Snowy". Defaults to "Sunny" if not clear.
        8. "road_type": The type of road. Must be exactly one of: "Highway", "Arterial", "Local". Defaults to "Local" if not clear.
        9. "traffic_density": Estimated traffic density/congestion level on a scale from 0.1 (completely empty) to 1.0 (bumper-to-bumper standstill).
        10. "visibility": Estimated visibility score from 0.1 (extremely poor/foggy/heavy rain) to 1.0 (perfectly clear day).
        11. "num_lanes": Estimated number of traffic lanes on the road. Defaults to 2 if not clear.
        
        You must return ONLY a valid JSON object matching this schema. No markdown formatting.
        """

        try:
            contents = [prompt]
            uploaded_file = None

            if file_path and os.path.exists(file_path):
                uploaded_file = self.client.files.upload(
                    file=file_path,
                    config={
                        "display_name": os.path.basename(file_path),
                        "mime_type": mime_type,
                    },
                )
                contents.append(uploaded_file)

            if text_content:
                contents.append(text_content)

            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents,
                config={"response_mime_type": "application/json"},
            )

            if uploaded_file:
                try:
                    self.client.files.delete(name=uploaded_file.name)
                except Exception as e:
                    print(f"Error deleting temporary file from Gemini API: {e}")

            return json.loads(response.text)

        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return self._get_fallback_mock_response(text_content or "Error processing incident report")

    def _get_fallback_mock_response(self, text: str) -> dict:
        """Fallback response when Gemini API is unavailable or key is missing."""
        # Simple extraction heuristics to make it look responsive
        lower_text = text.lower()
        
        incident_type = "Road Hazard"
        if "accident" in lower_text or "crash" in lower_text or "collision" in lower_text:
            incident_type = "Accident"
        elif "work" in lower_text or "construction" in lower_text or "repair" in lower_text:
            incident_type = "Road Construction"
        elif "breakdown" in lower_text or "stalled" in lower_text or "broke down" in lower_text:
            incident_type = "Vehicle Breakdown"
        elif "flood" in lower_text or "water" in lower_text or "rain" in lower_text:
            incident_type = "Flooding"
        elif "jam" in lower_text or "traffic" in lower_text or "delay" in lower_text:
            incident_type = "Traffic Jam"

        severity = "Medium"
        if "severe" in lower_text or "major" in lower_text or "blocked" in lower_text or "high" in lower_text:
            severity = "High"
        elif "minor" in lower_text or "small" in lower_text or "low" in lower_text:
            severity = "Low"

        # Mock values for ML model
        weather = "Rainy" if "rain" in lower_text or "wet" in lower_text else "Sunny"
        if "fog" in lower_text or "mist" in lower_text:
            weather = "Foggy"
        if "snow" in lower_text or "ice" in lower_text:
            weather = "Snowy"

        road_type = "Highway" if "highway" in lower_text or "expressway" in lower_text or "freeway" in lower_text else "Local"
        
        return {
            "incident_type": incident_type,
            "severity": severity,
            "latitude": None,
            "longitude": None,
            "confidence": 0.85,
            "summary": f"Reported incident of type {incident_type} via manual/fallback extraction. '{text[:60]}...'",
            "weather": weather,
            "road_type": road_type,
            "traffic_density": 0.85 if severity == "High" else (0.5 if severity == "Medium" else 0.25),
            "visibility": 0.3 if weather in ["Rainy", "Foggy"] else 0.9,
            "num_lanes": 3 if road_type == "High" else 2
        }
