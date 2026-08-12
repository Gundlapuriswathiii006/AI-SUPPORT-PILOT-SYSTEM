import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticketService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

function Escalations() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getAllTickets()
      .then((data) => setTickets((Array.isArray(data) ? data : []).filter((t) => t.escalated)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading escalations..." />;

  return (
    <div className="knowledge-base">
      <div className="section-header">
        <h1>Escalations</h1>
      </div>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        Tickets that need immediate attention.
      </p>

      <div className="kb-list">
        {tickets.length > 0 ? (
          tickets.map((ticket) => (
            <div key={ticket.id} className="kb-card">
              <h3>#{ticket.id} — {ticket.title || ticket.subject}</h3>
              <p className="kb-category">{ticket.category}</p>
              <p className="kb-excerpt">{ticket.description}</p>
              <div className="action-cell">
                <span className={`priority-badge ${(ticket.priority || '').toLowerCase()}`}>{ticket.priority}</span>
                <span className={`status-badge ${ticket.status}`}>{ticket.status?.replace('_', ' ')}</span>
                {ticket.status !== 'resolved' && (
                  <Button onClick={() => navigate(`/support/tickets/${ticket.id}/resolve`)}>Resolve</Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-data">No escalated tickets right now.</p>
        )}
      </div>
    </div>
  );
}

export default Escalations;
