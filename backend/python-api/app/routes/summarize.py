from fastapi import APIRouter
from app.models.schemas import SummarizeRequest, SummarizeResponse
from app.services import summarizer as summarizer_service

router = APIRouter()


@router.post("", response_model=SummarizeResponse)
def summarize_ticket(request: SummarizeRequest):
    summary = summarizer_service.summarize(
        ticket_id=request.ticketId or "",
        title=request.title,
        description=request.description,
        resolution_notes=request.resolutionNotes,
    )
    return SummarizeResponse(summary=summary)
