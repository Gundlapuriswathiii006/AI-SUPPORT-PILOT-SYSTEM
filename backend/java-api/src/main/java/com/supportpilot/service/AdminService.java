package com.supportpilot.service;

import com.supportpilot.dto.response.DashboardStats;
import com.supportpilot.model.Ticket;
import com.supportpilot.repository.TicketRepository;
import com.supportpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;

    public DashboardStats getDashboardStats() {
        long total = ticketRepository.count();
        long open = ticketRepository.countByStatus("open");
        long inProgress = ticketRepository.countByStatus("in_progress");
        long resolved = ticketRepository.countByStatus("resolved");
        long closed = ticketRepository.countByStatus("closed");
        long escalated = ticketRepository.countByStatus("escalated");
        long aiResolved = ticketRepository.countByAiClassifiedTrue();
        long totalUsers = userRepository.count();
        // SLA breached = high or critical tickets still open
        long slaBreached = ticketRepository.findByStatus("open").stream()
                .filter(t -> "high".equals(t.getPriority()) || "critical".equals(t.getPriority()))
                .count();

        return DashboardStats.builder()
                .totalTickets(total)
                .openTickets(open)
                .inProgressTickets(inProgress)
                .resolvedTickets(resolved)
                .closedTickets(closed)
                .escalatedTickets(escalated)
                .slaBreached(slaBreached)
                .totalUsers(totalUsers)
                .aiResolved(aiResolved)
                .build();
    }

    public List<Ticket> getRecentTickets() {
        return ticketRepository.findTop5ByOrderByCreatedAtDesc();
    }
}
