package com.supportpilot.controller;

import com.supportpilot.dto.request.KbArticleRequest;
import com.supportpilot.service.KnowledgeBaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/kb")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private final KnowledgeBaseService kbService;

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(kbService.getAll());
    }

    @GetMapping("/suggest")
    public ResponseEntity<?> suggest(@RequestParam String ticketId,
                                     @RequestParam(defaultValue = "3") int limit) {
        return ResponseEntity.ok(kbService.getSuggestedArticles(ticketId, limit));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return ResponseEntity.ok(kbService.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody KbArticleRequest req) {
        return ResponseEntity.ok(kbService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id,
                                    @RequestBody KbArticleRequest req) {
        return ResponseEntity.ok(kbService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        kbService.delete(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Article deleted.", "id", id));
    }
}
