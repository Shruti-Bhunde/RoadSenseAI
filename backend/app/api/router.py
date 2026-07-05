from fastapi import APIRouter
from app.api.routes import incident

api_router = APIRouter()
api_router.include_router(incident.router, tags=["incidents"])
