package com.supportpilot.controller;

import com.supportpilot.dto.request.ReassignRequest;
import com.supportpilot.dto.request.ResolveTicketRequest;
import com.supportpilot.dto.request.TicketRequest;
import com.supportpilot.model.User;
import com.supportpilot.service.TicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<?> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyTickets(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.getMyTickets(user.getId()));
    }

    @GetMapping("/escalated")
    public ResponseEntity<?> getEscalatedTickets() {
        return ResponseEntity.ok(ticketService.getEscalatedTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getById(id));
    }

    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody TicketRequest req,
                                          @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.createTicket(req, user));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveTicket(@PathVariable String id,
                                           @RequestBody(required = false) ResolveTicketRequest req,
                                           @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.resolveTicket(id, req, user));
    }

    @PutMapping("/{id}/escalate")
    public ResponseEntity<?> escalateTicket(@PathVariable String id,
                                            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.escalateTicket(id, user));
    }

    @PutMapping("/{id}/reassign")
    public ResponseEntity<?> reassignTicket(@PathVariable String id,
                                            @RequestBody ReassignRequest req,
                                            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ticketService.reassignTicket(id, req, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.ok(java.util.Map.of("message", "Ticket deleted.", "id", id));
    }
}
