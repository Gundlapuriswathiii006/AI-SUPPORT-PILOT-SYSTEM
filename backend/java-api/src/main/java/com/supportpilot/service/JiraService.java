package com.supportpilot.service;

import com.supportpilot.config.JiraConfig;
import com.supportpilot.model.Ticket;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Syncs SupportPilot tickets to JIRA Cloud using the JIRA REST API (v3).
 *
 * Design notes:
 * - Uses Basic Auth with an email + API token, which is how JIRA Cloud's
 *   REST API authenticates (generate a token at
 *   https://id.atlassian.com/manage-profile/security/api-tokens).
 * - Every call is wrapped so a JIRA outage or misconfiguration never
 *   blocks local ticket creation/updates — it only logs a warning and
 *   the ticket proceeds without a JIRA link. This mirrors how
 *   PythonAiService degrades gracefully when its dependency is down.
 * - If supportpilot.jira.enabled is false (default), this service is a
 *   no-op so the feature is entirely opt-in.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JiraService {

    private final RestTemplate restTemplate;
    private final JiraConfig jiraConfig;

    /**
     * Creates a JIRA issue for a newly created ticket.
     * Returns the updated Ticket object with jiraIssueKey/jiraIssueUrl set,
     * or the same ticket unchanged if JIRA isn't configured or the call fails.
     */
    public Ticket createIssueForTicket(Ticket ticket) {
        if (!jiraConfig.isConfigured()) {
            log.debug("JIRA sync skipped for ticket {} — integration not configured/enabled.", ticket.getId());
            return ticket;
        }

        try {
            String url = jiraConfig.getBaseUrl() + "/rest/api/3/issue";

            Map<String, Object> fields = new HashMap<>();
            fields.put("project", Map.of("key", jiraConfig.getProjectKey()));
            fields.put("summary", ticket.getTitle());
            fields.put("description", toAtlassianDocFormat(buildDescription(ticket)));
            fields.put("issuetype", Map.of("name", jiraConfig.getIssueType()));
            fields.put("labels", new String[]{"supportpilot", "priority-" + ticket.getPriority()});

            Map<String, Object> body = new HashMap<>();
            body.put("fields", fields);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, buildHeaders());

            @SuppressWarnings("unchecked")
            ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String issueKey = (String) response.getBody().get("key");
                if (issueKey != null) {
                    ticket.setJiraIssueKey(issueKey);
                    ticket.setJiraIssueUrl(jiraConfig.getBaseUrl() + "/browse/" + issueKey);
                    log.info("Created JIRA issue {} for ticket {}", issueKey, ticket.getId());
                }
            }
        } catch (Exception e) {
            // Deliberately non-fatal: JIRA being down/misconfigured must never
            // stop a support ticket from being created locally.
            log.warn("Could not sync ticket {} to JIRA: {}", ticket.getId(), e.getMessage());
        }

        return ticket;
    }

    /**
     * Adds a comment to the linked JIRA issue when a ticket is resolved/updated.
     * No-op if the ticket was never synced to JIRA.
     */
    public void addComment(Ticket ticket, String commentText) {
        if (!jiraConfig.isConfigured() || ticket.getJiraIssueKey() == null) return;

        try {
            String url = jiraConfig.getBaseUrl() + "/rest/api/3/issue/" + ticket.getJiraIssueKey() + "/comment";
            Map<String, Object> body = Map.of("body", toAtlassianDocFormat(commentText));
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, buildHeaders());
            restTemplate.exchange(url, HttpMethod.POST, request, Map.class);
            log.info("Added comment to JIRA issue {}", ticket.getJiraIssueKey());
        } catch (Exception e) {
            log.warn("Could not add comment to JIRA issue {}: {}", ticket.getJiraIssueKey(), e.getMessage());
        }
    }

    private String buildDescription(Ticket ticket) {
        return "Synced from SupportPilot\n\n"
                + "Category: " + ticket.getCategory() + "\n"
                + "Priority: " + ticket.getPriority() + "\n"
                + "Raised by: " + ticket.getRaisedBy() + "\n\n"
                + (ticket.getDescription() != null ? ticket.getDescription() : "");
    }

    /** JIRA Cloud's v3 API expects descriptions/comments in Atlassian Document Format (ADF), not plain strings. */
    private Map<String, Object> toAtlassianDocFormat(String text) {
        return Map.of(
                "type", "doc",
                "version", 1,
                "content", new Object[]{
                        Map.of(
                                "type", "paragraph",
                                "content", new Object[]{
                                        Map.of("type", "text", "text", text)
                                }
                        )
                }
        );
    }

    private HttpHeaders buildHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String credentials = jiraConfig.getEmail() + ":" + jiraConfig.getApiToken();
        String encoded = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
        headers.set("Authorization", "Basic " + encoded);
        return headers;
    }
}
