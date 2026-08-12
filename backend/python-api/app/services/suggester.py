import logging
import re
from typing import List

logger = logging.getLogger(__name__)

# Common stop words to ignore during scoring
STOP_WORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "by", "for",
    "from", "has", "have", "he", "her", "his", "how", "i", "in", "is",
    "it", "its", "me", "my", "not", "of", "on", "or", "our", "she",
    "so", "than", "that", "the", "their", "them", "then", "there", "they",
    "this", "to", "us", "was", "we", "were", "what", "when", "where",
    "which", "who", "will", "with", "you", "your",
}


def _tokenize(text: str) -> set:
    words = re.findall(r"[a-zA-Z]{3,}", text.lower())
    return {w for w in words if w not in STOP_WORDS}


def _score_article(article_id: str, article_title: str, article_content: str,
                   article_category: str, ticket_text: str, ticket_category: str) -> float:
    """Score an article's relevance to a ticket using keyword overlap and category match."""
    score = 0.0
    ticket_tokens = _tokenize(ticket_text)

    # Category match bonus
    if article_category and ticket_category and article_category.lower() == ticket_category.lower():
        score += 3.0

    # Title keyword overlap (weighted higher)
    title_tokens = _tokenize(article_title)
    title_overlap = len(ticket_tokens & title_tokens)
    score += title_overlap * 2.0

    # Content keyword overlap
    content_tokens = _tokenize(article_content or "")
    content_overlap = len(ticket_tokens & content_tokens)
    score += content_overlap * 0.5

    return score


def suggest(ticket_id: str, title: str, description: str, category: str,
            limit: int, articles: List[dict] = None) -> List[str]:
    """
    Return a ranked list of KB article IDs for the given ticket.
    
    `articles` is a list of dicts with keys: id, title, content, category.
    If not provided (e.g., called without context), returns empty list and
    the Java side falls back to category-matched articles.
    """
    if not articles:
        logger.debug("No articles provided to suggester — Java will use fallback.")
        return []

    ticket_text = f"{title} {description}"
    scored = []
    for art in articles:
        score = _score_article(
            art.get("id", ""),
            art.get("title", ""),
            art.get("content", ""),
            art.get("category", ""),
            ticket_text,
            category or "",
        )
        if score > 0:
            scored.append((art["id"], score))

    scored.sort(key=lambda x: x[1], reverse=True)
    return [aid for aid, _ in scored[:limit]]
