import os
import uuid
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status

from app.database import get_db
from app.schemas.incident import IncidentResponse, IncidentCreate
from app.repositories.incident_repository import IncidentRepository
from app.services.gemini_service import GeminiService
from app.services.ml_service import MLService
from app.config.settings import settings

router = APIRouter()
gemini_service = GeminiService()
ml_service = MLService()

# Helper to map MIME type to media_type
def get_media_type_from_mime(mime: str) -> str:
    if not mime:
        return "text"
    if mime.startswith("image/"):
        return "image"
    if mime.startswith("video/"):
        return "video"
    if mime.startswith("audio/") or mime.startswith("application/octet-stream"):
        return "voice"
    return "text"

@router.post("/report", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
async def report_incident(
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    latitude: Optional[float] = Form(None),
    longitude: Optional[float] = Form(None),
    reported_at: Optional[str] = Form(None),
    db: Any = Depends(get_db)
):
    """
    Submits a traffic incident report. The report can be text descriptions, 
    voice clips, images, or videos.
    """
    if not description or not description.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A text description is required for every report."
        )

    if latitude is None or longitude is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location is required. Please provide latitude and longitude or allow location access."
        )

    file_path = None
    media_type = "text"
    media_url = None
    mime_type = None

    # Handle file upload if provided
    if file:
        # Create unique filename
        filename = f"{uuid.uuid4()}_{file.filename}"
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        file_path = os.path.join(settings.UPLOAD_DIR, filename)
        
        # Save file to disk
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
            
        mime_type = file.content_type
        media_type = get_media_type_from_mime(mime_type)
        # Using a relative path for the file serving in MVP mode
        media_url = f"/uploads/{filename}"

    # Step 1: Call Gemini to analyze report and return JSON schema
    ai_result = gemini_service.analyze_incident(
        file_path=file_path,
        mime_type=mime_type,
        text_content=description
    )

    # Step 2: Parse reported time from the user device and extract hour for the ML model
    if reported_at:
        try:
            reported_at_value = datetime.fromisoformat(reported_at.replace('Z', '+00:00'))
            # Convert incoming device time to IST (Asia/Kolkata) and store as naive local IST datetime
            reported_at_value = reported_at_value.astimezone(ZoneInfo('Asia/Kolkata')).replace(tzinfo=None)
        except ValueError:
            reported_at_value = datetime.now(ZoneInfo('Asia/Kolkata')).replace(tzinfo=None)
    else:
        reported_at_value = datetime.now(ZoneInfo('Asia/Kolkata')).replace(tzinfo=None)

    weather = ai_result.get("weather", "Sunny")
    road_type = ai_result.get("road_type", "Local")
    traffic_density = ai_result.get("traffic_density", 0.5)
    visibility = ai_result.get("visibility", 1.0)
    num_lanes = ai_result.get("num_lanes", 2)
    hour = reported_at_value.hour

    # Step 3: Run Random Forest Classifier for Traffic Impact
    traffic_impact = ml_service.predict_traffic_impact(
        weather=weather,
        road_type=road_type,
        traffic_density=traffic_density,
        visibility=visibility,
        num_lanes=num_lanes,
        hour=hour
    )

    # Step 4: Save to database
    incident_latitude = latitude if latitude is not None else ai_result.get("latitude")
    incident_longitude = longitude if longitude is not None else ai_result.get("longitude")

    new_incident_data = IncidentCreate(
        incident_type=ai_result.get("incident_type", "Road Hazard"),
        description=description if description else ai_result.get("summary"),
        ai_summary=ai_result.get("summary", "No summary generated."),
        severity=ai_result.get("severity", "Medium"),
        traffic_impact=traffic_impact,
        latitude=incident_latitude,
        longitude=incident_longitude,
        media_type=media_type,
        media_url=media_url,
        confidence=ai_result.get("confidence", 1.0),
        reported_at=reported_at_value
    )

    db_incident = IncidentRepository.create(db, new_incident_data)
    return db_incident

@router.get("/incidents", response_model=List[IncidentResponse])
def read_incidents(skip: int = 0, limit: int = 100, db: Any = Depends(get_db)):
    return IncidentRepository.get_all(db, skip=skip, limit=limit)

@router.get("/incident/{incident_id}", response_model=IncidentResponse)
def read_incident(incident_id: int, db: Any = Depends(get_db)):
    db_incident = IncidentRepository.get_by_id(db, incident_id)
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return db_incident

@router.delete("/incident/{incident_id}")
def remove_incident(incident_id: int, db: Any = Depends(get_db)):
    success = IncidentRepository.delete(db, incident_id)
    if not success:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"message": "Incident deleted successfully"}
