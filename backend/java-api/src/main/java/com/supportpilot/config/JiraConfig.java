package com.supportpilot.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Holds JIRA Cloud connection settings, all sourced from environment
 * variables (see .env.example). Nothing is hardcoded here — if
 * jira.enabled is false or the required fields are blank, JiraService
 * simply skips syncing instead of failing ticket creation.
 */
@Component
public class JiraConfig {

    @Value("${supportpilot.jira.enabled:false}")
    private boolean enabled;

    @Value("${supportpilot.jira.base-url:}")
    private String baseUrl;

    @Value("${supportpilot.jira.email:}")
    private String email;

    @Value("${supportpilot.jira.api-token:}")
    private String apiToken;

    @Value("${supportpilot.jira.project-key:}")
    private String projectKey;

    @Value("${supportpilot.jira.issue-type:Task}")
    private String issueType;

    public boolean isConfigured() {
    boolean configured = enabled
            && baseUrl != null && !baseUrl.isBlank()
            && email != null && !email.isBlank()
            && apiToken != null && !apiToken.isBlank()
            && projectKey != null && !projectKey.isBlank();

    System.out.println(
            "JIRA CONFIG -> enabled=" + enabled
            + ", baseUrl=" + baseUrl
            + ", email=" + email
            + ", tokenPresent=" + (apiToken != null && !apiToken.isBlank())
            + ", projectKey=" + projectKey
    );

    return configured;
}

    public boolean isEnabled() { return enabled; }
    public String getBaseUrl() { return baseUrl; }
    public String getEmail() { return email; }
    public String getApiToken() { return apiToken; }
    public String getProjectKey() { return projectKey; }
    public String getIssueType() { return issueType; }
}
