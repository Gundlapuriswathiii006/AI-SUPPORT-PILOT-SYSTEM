package com.supportpilot.service;

import com.supportpilot.config.PythonApiConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PythonAiService {

    private final RestTemplate restTemplate;
    private final PythonApiConfig pythonApiConfig;

    /**
     * Classify ticket priority via the Python ML service.
     * Returns priority string: low | medium | high | critical
     * Falls back to keyword heuristic when Python service is unreachable.
     */
    public String classifyPriority(String title, String description, String category) {
        try {
            String url = pythonApiConfig.getPythonApiUrl() + "/classify";
            Map<String, String> body = new HashMap<>();
            body.put("title", title);
            body.put("description", description);
            body.put("category", category != null ? category : "IT Support");

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String priority = (String) response.getBody().get("priority");
                if (priority != null && !priority.isEmpty()) {
                    log.info("AI classified ticket as: {}", priority);
                    return priority.toLowerCase();
                }
            }
        } catch (Exception e) {
            log.warn("Python AI service unreachable, using heuristic fallback: {}", e.getMessage());
        }
        return heuristicClassify(title, description);
    }

    /**
     * Get AI-suggested KB article IDs for a ticket.
     */
    @SuppressWarnings("unchecked")
    public java.util.List<String> suggestArticles(String ticketId, String title,
                                                   String description, String category, int limit) {
        try {
            String url = pythonApiConfig.getPythonApiUrl() + "/suggest";
            Map<String, Object> body = new HashMap<>();
            body.put("ticketId", ticketId);
            body.put("title", title);
            body.put("description", description);
            body.put("category", category != null ? category : "IT Support");
            body.put("limit", limit);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Object articleIds = response.getBody().get("articleIds");
                if (articleIds instanceof java.util.List) {
                    return (java.util.List<String>) articleIds;
                }
            }
        } catch (Exception e) {
            log.warn("Python AI suggest unreachable: {}", e.getMessage());
        }
        return java.util.Collections.emptyList();
    }

    /**
     * Summarize a ticket via the Python AI service.
     */
    public String summarize(String ticketId, String title, String description, String resolutionNotes) {
        try {
            String url = pythonApiConfig.getPythonApiUrl() + "/summarize";
            Map<String, String> body = new HashMap<>();
            body.put("ticketId", ticketId);
            body.put("title", title);
            body.put("description", description);
            if (resolutionNotes != null) body.put("resolutionNotes", resolutionNotes);

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String summary = (String) response.getBody().get("summary");
                if (summary != null) return summary;
            }
        } catch (Exception e) {
            log.warn("Python AI summarize unreachable: {}", e.getMessage());
        }
        // Fallback: truncate description
        String text = "Ticket: " + title + ". " + (description != null ? description : "");
        return text.length() > 300 ? text.substring(0, 297) + "..." : text;
    }

    // ─── Heuristic fallback ────────────────────────────────────────────────────

    private String heuristicClassify(String title, String description) {
        String text = ((title != null ? title : "") + " " + (description != null ? description : "")).toLowerCase();

        String[] criticalKw = {"down", "outage", "breach", "crash", "critical", "emergency",
                "production", "server down", "data loss", "security", "unauthorized",
                "entire", "all users", "complete failure"};
        String[] highKw = {"slow", "error", "fail", "not working", "broken", "corrupted",
                "cannot", "unable", "blocked", "vpn", "login", "antivirus", "urgent"};
        String[] mediumKw = {"issue", "problem", "need", "request", "access", "permission",
                "install", "setup", "configure", "update"};

        int criticalCount = countMatches(text, criticalKw);
        int highCount = countMatches(text, highKw);
        int mediumCount = countMatches(text, mediumKw);

        if (criticalCount >= 2) return "critical";
        if (criticalCount == 1) return "high";
        if (highCount >= 2) return "high";
        if (highCount == 1) return "medium";
        if (mediumCount >= 1) return "medium";
        return "low";
    }

    private int countMatches(String text, String[] keywords) {
        int count = 0;
        for (String kw : keywords) {
            if (text.contains(kw)) count++;
        }
        return count;
    }
}
