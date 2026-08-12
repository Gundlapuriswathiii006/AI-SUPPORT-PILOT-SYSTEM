package com.supportpilot.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {

    @Id
    @Column(nullable = false, updatable = false, length = 36)
    private String id;

    @Column(nullable = false)
    private String title;

    private String subject;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String tags;

    /**
     * Priority values: low | medium | high | critical
     * Set automatically by the Python AI classifier on ticket creation.
     */
    @Column(nullable = false)
    @Builder.Default
    private String priority = "low";

    @Builder.Default
    private boolean aiClassified = false;

    /**
     * Status values: open | in_progress | resolved | closed | escalated
     */
    @Column(nullable = false)
    @Builder.Default
    private String status = "open";

    @Builder.Default
    private boolean escalated = false;

    /** ID of the user who raised the ticket */
    @Column(nullable = false, length = 36)
    private String userId;

    /** Display name of the user who raised the ticket */
    private String raisedBy;

    /** ID or name of the agent the ticket is assigned to */
    private String assignedTo;

    @Column(columnDefinition = "TEXT")
    private String resolutionNotes;

    /** JIRA issue key this ticket is synced to, e.g. "SUP-142". Null if JIRA sync is disabled or failed. */
    private String jiraIssueKey;

    /** Direct browser link to the synced JIRA issue, for convenience in the UI. */
    private String jiraIssueUrl;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;

    @PrePersist
    protected void prePersist() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.subject == null && this.title != null) {
            this.subject = this.title;
        }
    }
}
