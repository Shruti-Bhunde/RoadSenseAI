import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report

# Set random seed for reproducibility
np.random.seed(42)

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'indian_roads_dataset.csv')
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'traffic_model.joblib')
SAVE_THRESHOLD = 0.70

WEATHER_MAP = {
    'clear': 'Sunny',
    'sunny': 'Sunny',
    'rain': 'Rainy',
    'rainy': 'Rainy',
    'fog': 'Foggy',
    'foggy': 'Foggy',
    'snow': 'Snowy',
    'snowy': 'Snowy',
}

ROAD_TYPE_MAP = {
    'highway': 'Highway',
    'urban': 'Local',
    'rural': 'Local',
    'arterial': 'Arterial',
}

TRAFFIC_DENSITY_MAP = {
    'low': 0.2,
    'medium': 0.5,
    'high': 0.85,
}

VISIBILITY_MAP = {
    'low': 0.25,
    'medium': 0.5,
    'high': 0.85,
}


def load_dataset(path):
    if not os.path.exists(path):
        raise FileNotFoundError(f"Dataset file not found at {path}")

    df = pd.read_csv(path)
    df = df.copy()

    # Normalize and map feature columns
    df['weather'] = df['weather'].astype(str).str.strip().str.lower().map(WEATHER_MAP)
    df['road_type'] = df['road_type'].astype(str).str.strip().str.lower().map(ROAD_TYPE_MAP)
    df['traffic_density'] = df['traffic_density'].astype(str).str.strip().str.lower().map(TRAFFIC_DENSITY_MAP)
    df['visibility'] = df['visibility'].astype(str).str.strip().str.lower().map(VISIBILITY_MAP)

    # Some datasets may already use numeric forms; keep them if available
    df['num_lanes'] = pd.to_numeric(df['lanes'], errors='coerce')
    df['hour'] = pd.to_numeric(df['hour'], errors='coerce')
    df['risk_score'] = pd.to_numeric(df['risk_score'], errors='coerce')

    # Drop rows with missing values in required fields
    required_columns = ['weather', 'road_type', 'traffic_density', 'visibility', 'num_lanes', 'hour', 'risk_score']
    df = df.dropna(subset=required_columns)

    df['traffic_impact'] = df['risk_score'].apply(map_impact)
    return df


def map_impact(score):
    if score < 0.4:
        return 'Low'
    if score < 0.7:
        return 'Medium'
    return 'High'


if __name__ == '__main__':
    df = load_dataset(DATA_PATH)

    print(f"Loaded dataset with {len(df)} rows")
    print("Using features: weather, road_type, traffic_density, visibility, num_lanes, hour")

    weather_encoder = LabelEncoder()
    road_type_encoder = LabelEncoder()
    target_encoder = LabelEncoder()

    df['weather_encoded'] = weather_encoder.fit_transform(df['weather'])
    df['road_type_encoded'] = road_type_encoder.fit_transform(df['road_type'])
    df['traffic_impact_encoded'] = target_encoder.fit_transform(df['traffic_impact'])

    X = df[['weather_encoded', 'road_type_encoded', 'traffic_density', 'visibility', 'num_lanes', 'hour']]
    y = df['traffic_impact_encoded']

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )

    model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)

    print(f"Test accuracy on 20% holdout: {accuracy:.4f}")
    print("Classification report:")
    print(classification_report(y_test, y_pred, target_names=target_encoder.classes_))

    if accuracy >= SAVE_THRESHOLD:
        os.makedirs(MODEL_DIR, exist_ok=True)
        payload = {
            'model': model,
            'weather_encoder': weather_encoder,
            'road_type_encoder': road_type_encoder,
            'target_encoder': target_encoder,
            'features': ['weather', 'road_type', 'traffic_density', 'visibility', 'num_lanes', 'hour'],
        }
        joblib.dump(payload, MODEL_PATH)
        print(f"Model saved to {MODEL_PATH}")
    else:
        print(f"Model accuracy {accuracy:.4f} is below the save threshold of {SAVE_THRESHOLD:.2f}. Model was not saved.")
