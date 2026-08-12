package com.supportpilot.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardStats {
    private long totalTickets;
    private long openTickets;
    private long resolvedTickets;
    private long slaBreached;
    private long totalUsers;
    private long aiResolved;
    private long inProgressTickets;
    private long escalatedTickets;
    private long closedTickets;
}
