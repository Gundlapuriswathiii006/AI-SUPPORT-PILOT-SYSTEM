package com.supportpilot.controller;

import com.supportpilot.config.JiraConfig;
import com.supportpilot.model.Ticket;
import com.supportpilot.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Read-only endpoints backing the "JIRA" panel on the frontend.
 * Surfaces the connection status plus every ticket that has already
 * been synced to a JIRA issue (see JiraService).
 */
@RestController
@RequestMapping("/api/jira")
@RequiredArgsConstructor
public class JiraController {

    private final TicketRepository ticketRepository;
    private final JiraConfig jiraConfig;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus() {
        return ResponseEntity.ok(Map.of(
                "connected", jiraConfig.isConfigured(),
                "enabled", jiraConfig.isEnabled(),
                "baseUrl", jiraConfig.getBaseUrl() == null ? "" : jiraConfig.getBaseUrl(),
                "projectKey", jiraConfig.getProjectKey() == null ? "" : jiraConfig.getProjectKey()
        ));
    }

    @GetMapping("/issues")
    public ResponseEntity<?> getIssues() {
        List<Ticket> synced = ticketRepository.findByJiraIssueKeyIsNotNullOrderByCreatedAtDesc();

        List<Map<String, Object>> issues = synced.stream().map(t -> {
            Map<String, Object> issue = new java.util.HashMap<>();
            issue.put("ticketId", t.getId());
            issue.put("issueKey", t.getJiraIssueKey());
            issue.put("issueUrl", t.getJiraIssueUrl());
            issue.put("summary", t.getTitle());
            issue.put("status", t.getStatus());
            issue.put("priority", t.getPriority());
            issue.put("category", t.getCategory());
            issue.put("raisedBy", t.getRaisedBy());
            issue.put("createdAt", t.getCreatedAt());
            return issue;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "connected", jiraConfig.isConfigured(),
                "count", issues.size(),
                "issues", issues
        ));
    }
}
