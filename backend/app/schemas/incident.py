from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class IncidentBase(BaseModel):
    incident_type: str
    description: Optional[str] = None
    ai_summary: Optional[str] = None
    severity: Optional[str] = None
    traffic_impact: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    confidence: Optional[float] = None

class IncidentCreate(IncidentBase):
    reported_at: Optional[datetime] = None

class IncidentResponse(IncidentBase):
    id: int
    reported_at: datetime

    class Config:
        from_attributes = True
