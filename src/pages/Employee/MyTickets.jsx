import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';

export default function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    ticketService.getAllTickets()
      .then((data) => {
        if (Array.isArray(data)) setTickets(data);
      })
      .catch(() => {/* no backend — show empty */});
  }, []);

  return (
    <div>
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '1.5rem 1.5rem 1rem' }}>
          <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>
            My Tickets
          </h1>
        </div>

        <table className="sp-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Title</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data">No tickets found.</td>
              </tr>
            ) : (
              tickets.map((ticket) => (
                <tr key={ticket.id} onClick={() => navigate(`/employee/tickets/${ticket.id}`)}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title || ticket.subject}</td>
                  <td>{ticket.category}</td>
                  <td>
                    <span className={`priority-badge ${(ticket.priority || '').toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${(ticket.status || '').toLowerCase()}`}>
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
