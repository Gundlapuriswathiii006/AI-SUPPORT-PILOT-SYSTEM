import logging

logger = logging.getLogger(__name__)

# Sentence-ending punctuation
_SENTENCE_ENDS = {".", "!", "?"}


def _extract_sentences(text: str, max_sentences: int = 3) -> str:
    """Extract the first N complete sentences from text."""
    if not text:
        return ""
    sentences = []
    current = []
    for char in text:
        current.append(char)
        if char in _SENTENCE_ENDS:
            sentences.append("".join(current).strip())
            current = []
            if len(sentences) >= max_sentences:
                break
    # Include any trailing fragment
    if current and len(sentences) < max_sentences:
        fragment = "".join(current).strip()
        if fragment:
            sentences.append(fragment)
    return " ".join(sentences)


def summarize(ticket_id: str, title: str, description: str,
              resolution_notes: str = None) -> str:
    """
    Produce a concise plain-text summary of a ticket.
    Uses rule-based extraction (no external LLM required).
    
    Format:  "Ticket: <title>. Issue: <first 2 sentences of description>.
              Resolution: <first sentence of notes>."
    """
    parts = []

    # Title line
    if title:
        parts.append(f"Ticket: {title.strip()}.")

    # Description excerpt
    desc_excerpt = _extract_sentences(description or "", max_sentences=2)
    if desc_excerpt:
        parts.append(f"Issue: {desc_excerpt}")

    # Resolution excerpt
    if resolution_notes and resolution_notes.strip():
        res_excerpt = _extract_sentences(resolution_notes, max_sentences=1)
        if res_excerpt:
            parts.append(f"Resolution: {res_excerpt}")

    summary = " ".join(parts)

    # Hard cap at 400 characters
    if len(summary) > 400:
        summary = summary[:397] + "..."

    return summary if summary else (description or "")[:200]
