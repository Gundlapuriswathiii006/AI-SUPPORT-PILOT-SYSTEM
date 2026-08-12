package com.supportpilot.service;

import com.supportpilot.dto.request.KbArticleRequest;
import com.supportpilot.model.KbArticle;
import com.supportpilot.repository.KbArticleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class KnowledgeBaseService {

    private final KbArticleRepository kbArticleRepository;
    private final PythonAiService pythonAiService;
    private final TicketService ticketService;

    public List<KbArticle> getAll() {
        return kbArticleRepository.findAll();
    }

    public KbArticle getById(String id) {
        return kbArticleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("KB article not found: " + id));
    }

    @Transactional
    public KbArticle create(KbArticleRequest req) {
        KbArticle article = KbArticle.builder()
                .title(req.getTitle())
                .category(req.getCategory())
                .content(req.getContent())
                .build();
        return kbArticleRepository.save(article);
    }

    @Transactional
    public KbArticle update(String id, KbArticleRequest req) {
        KbArticle article = getById(id);
        if (req.getTitle() != null) article.setTitle(req.getTitle());
        if (req.getCategory() != null) article.setCategory(req.getCategory());
        if (req.getContent() != null) article.setContent(req.getContent());
        return kbArticleRepository.save(article);
    }

    @Transactional
    public void delete(String id) {
        if (!kbArticleRepository.existsById(id)) {
            throw new RuntimeException("KB article not found: " + id);
        }
        kbArticleRepository.deleteById(id);
    }

    /**
     * Get AI-suggested KB articles for a given ticket.
     * 1. Ask Python AI service for ranked article IDs.
     * 2. Fall back to category-based matching if AI returns nothing.
     */
    public List<KbArticle> getSuggestedArticles(String ticketId, int limit) {
        var ticket = ticketService.getById(ticketId);
        List<String> aiIds = pythonAiService.suggestArticles(
                ticketId, ticket.getTitle(), ticket.getDescription(),
                ticket.getCategory(), limit);

        if (!aiIds.isEmpty()) {
            return aiIds.stream()
                    .map(id -> kbArticleRepository.findById(id).orElse(null))
                    .filter(a -> a != null)
                    .collect(Collectors.toList());
        }

        // Fallback: articles in same category
        List<KbArticle> byCategory = kbArticleRepository.findByCategory(ticket.getCategory());
        return byCategory.stream().limit(limit).collect(Collectors.toList());
    }
}
