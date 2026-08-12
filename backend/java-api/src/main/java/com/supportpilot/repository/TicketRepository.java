package com.supportpilot.repository;

import com.supportpilot.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, String> {
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByEscalatedTrue();
    List<Ticket> findByStatus(String status);
    List<Ticket> findByPriority(String priority);
    List<Ticket> findByCategory(String category);
    List<Ticket> findByAssignedTo(String assignedTo);
    long countByStatus(String status);
    long countByPriority(String priority);
    long countByAiClassifiedTrue();

    @Query("SELECT t.category, COUNT(t) FROM Ticket t GROUP BY t.category")
    List<Object[]> countByCategory();

    @Query("SELECT t.priority, COUNT(t) FROM Ticket t GROUP BY t.priority")
    List<Object[]> countGroupByPriority();

    @Query("SELECT t.status, COUNT(t) FROM Ticket t GROUP BY t.status")
    List<Object[]> countGroupByStatus();

    @Query("SELECT FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM') as month, COUNT(t) " +
           "FROM Ticket t GROUP BY FUNCTION('TO_CHAR', t.createdAt, 'YYYY-MM') " +
           "ORDER BY month DESC")
    List<Object[]> countByMonth();

    List<Ticket> findTop5ByOrderByCreatedAtDesc();
}
