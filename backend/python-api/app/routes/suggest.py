from fastapi import APIRouter
from app.models.schemas import SuggestRequest, SuggestResponse
from app.services import suggester as suggester_service

router = APIRouter()


@router.post("", response_model=SuggestResponse)
def suggest_articles(request: SuggestRequest):
    """
    Called by Java KnowledgeBaseService with ticket context.
    The Java service passes articles as part of a richer internal call;
    this endpoint serves as the AI gateway — Java handles article lookup.
    """
    article_ids = suggester_service.suggest(
        ticket_id=request.ticketId or "",
        title=request.title,
        description=request.description,
        category=request.category or "",
        limit=request.limit or 3,
        articles=None,  # Java side resolves articles; Python scores if articles provided
    )
    return SuggestResponse(articleIds=article_ids)
