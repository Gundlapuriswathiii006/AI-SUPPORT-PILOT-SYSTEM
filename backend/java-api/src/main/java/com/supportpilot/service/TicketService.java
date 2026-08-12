package com.supportpilot.service;

import com.supportpilot.dto.request.ReassignRequest;
import com.supportpilot.dto.request.ResolveTicketRequest;
import com.supportpilot.dto.request.TicketRequest;
import com.supportpilot.model.Notification;
import com.supportpilot.model.Ticket;
import com.supportpilot.model.User;
import com.supportpilot.repository.NotificationRepository;
import com.supportpilot.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {

    private final TicketRepository ticketRepository;
    private final NotificationRepository notificationRepository;
    private final PythonAiService pythonAiService;
    private final JiraService jiraService;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<Ticket> getMyTickets(String userId) {
        return ticketRepository.findByUserId(userId);
    }

    public List<Ticket> getEscalatedTickets() {
        return ticketRepository.findByEscalatedTrue();
    }

    public Ticket getById(String ticketId) {
        return ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found: " + ticketId));
    }

    @Transactional
    public Ticket createTicket(TicketRequest req, User creator) {
        // AI priority classification
        String priority = pythonAiService.classifyPriority(
                req.getTitle(), req.getDescription(), req.getCategory());

        Ticket ticket = Ticket.builder()
                .title(req.getTitle())
                .subject(req.getTitle())
                .category(req.getCategory())
                .description(req.getDescription())
                .tags(req.getTags())
                .priority(priority)
                .aiClassified(true)
                .status("open")
                .escalated(false)
                .userId(creator.getId())
                .raisedBy(creator.getName())
                .build();

        ticket = ticketRepository.save(ticket);
        log.info("Created ticket {} with AI priority: {}", ticket.getId(), priority);

        // Sync to JIRA (no-op if not configured; never blocks ticket creation on failure)
        ticket = jiraService.createIssueForTicket(ticket);
        if (ticket.getJiraIssueKey() != null) {
            ticket = ticketRepository.save(ticket);
        }

        // Notify the creator
        notifyUser(creator.getId(), "Your ticket '" + req.getTitle() +
                "' was submitted. AI priority: " + priority.toUpperCase(), ticket.getId());

        return ticket;
    }

    @Transactional
    public Ticket resolveTicket(String ticketId, ResolveTicketRequest req, User agent) {
        Ticket ticket = getById(ticketId);
        ticket.setStatus("resolved");
        ticket.setResolvedAt(LocalDateTime.now());
        if (req != null && req.getResolutionNotes() != null) {
            ticket.setResolutionNotes(req.getResolutionNotes());
        }
        ticket = ticketRepository.save(ticket);

        // Reflect the resolution on the linked JIRA issue too, if one exists.
        jiraService.addComment(ticket, "Resolved in SupportPilot by " + agent.getName()
                + (req != null && req.getResolutionNotes() != null ? ": " + req.getResolutionNotes() : "."));

        notifyUser(ticket.getUserId(),
                "Your ticket '" + ticket.getTitle() + "' has been resolved.", ticketId);
        return ticket;
    }

    @Transactional
    public Ticket escalateTicket(String ticketId, User agent) {
        Ticket ticket = getById(ticketId);
        ticket.setEscalated(true);
        ticket.setStatus("escalated");
        // Bump priority
        String current = ticket.getPriority() != null ? ticket.getPriority() : "low";
        if ("low".equals(current)) ticket.setPriority("medium");
        else if ("medium".equals(current)) ticket.setPriority("high");
        else ticket.setPriority("critical");

        ticket = ticketRepository.save(ticket);
        notifyUser(ticket.getUserId(),
                "Your ticket '" + ticket.getTitle() + "' has been escalated.", ticketId);
        return ticket;
    }

    @Transactional
    public Ticket reassignTicket(String ticketId, ReassignRequest req, User agent) {
        Ticket ticket = getById(ticketId);
        String assignee = req.getAgentName() != null ? req.getAgentName() : req.getAgentId();
        ticket.setAssignedTo(assignee);
        ticket.setStatus("in_progress");
        return ticketRepository.save(ticket);
    }

    @Transactional
    public void deleteTicket(String ticketId) {
        if (!ticketRepository.existsById(ticketId)) {
            throw new RuntimeException("Ticket not found: " + ticketId);
        }
        ticketRepository.deleteById(ticketId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void notifyUser(String userId, String message, String ticketId) {
        try {
            Notification notification = Notification.builder()
                    .userId(userId)
                    .message(message)
                    .ticketId(ticketId)
                    .build();
            notificationRepository.save(notification);
        } catch (Exception e) {
            log.warn("Failed to create notification: {}", e.getMessage());
        }
    }
}
