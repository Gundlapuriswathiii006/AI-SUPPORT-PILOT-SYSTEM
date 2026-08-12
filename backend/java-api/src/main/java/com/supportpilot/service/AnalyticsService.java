package com.supportpilot.service;

import com.supportpilot.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final TicketRepository ticketRepository;

    public Map<String, Object> getReports() {
        Map<String, Object> report = new LinkedHashMap<>();

        // By category
        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (Object[] row : ticketRepository.countByCategory()) {
            byCategory.put((String) row[0], (Long) row[1]);
        }

        // By priority
        Map<String, Long> byPriority = new LinkedHashMap<>();
        for (Object[] row : ticketRepository.countGroupByPriority()) {
            byPriority.put((String) row[0], (Long) row[1]);
        }

        // By status
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (Object[] row : ticketRepository.countGroupByStatus()) {
            byStatus.put((String) row[0], (Long) row[1]);
        }

        // Monthly volume (last 6 months)
        List<Map<String, Object>> monthlyVolume = new ArrayList<>();
        List<Object[]> monthRows = ticketRepository.countByMonth();
        int take = Math.min(6, monthRows.size());
        for (int i = take - 1; i >= 0; i--) {
            Object[] row = monthRows.get(i);
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("month", row[0]);
            entry.put("count", row[1]);
            monthlyVolume.add(entry);
        }

        report.put("totalTickets", ticketRepository.count());
        report.put("resolved", ticketRepository.countByStatus("resolved"));
        report.put("byCategory", byCategory);
        report.put("byPriority", byPriority);
        report.put("byStatus", byStatus);
        report.put("monthlyVolume", monthlyVolume);

        return report;
    }
}
