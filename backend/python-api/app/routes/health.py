from fastapi import APIRouter
from app.models.schemas import HealthResponse
from app.services.classifier import is_model_loaded

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(
        status="ok",
        service="supportpilot-python-ai",
        version="1.0.0",
        model_loaded=is_model_loaded(),
    )
