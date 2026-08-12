import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ticketService } from '../../services/ticketService';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

function AllTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    ticketService.getAllTickets()
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleEscalate = async (ticketId) => {
    await ticketService.escalateTicket(ticketId);
    toast.success('Ticket escalated.');
    load();
  };

  if (loading) return <Loader text="Loading tickets..." />;

  return (
    <div className="knowledge-base">
      <div className="section-header">
        <div>
          <span className="sp-eyebrow">Support queue</span>
          <h1>All Tickets</h1>
          <p className="sp-page-copy">Review incoming requests and escalations in one place.</p>
          </div>
          </div>
        
      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Raised By</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title || ticket.subject}</td>
                  <td><strong>{ticket.raisedBy || 'Unknown'}</strong><small className="sp-table-subtext">{ticket.customerEmail || 'No email on file'}</small></td>
                  <td>{ticket.category}</td>
                  <td>
                    <span className={`priority-badge ${(ticket.priority || '').toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ticket.status}`}>
                      {ticket.status?.replace('_', ' ')}
                    </span>
                    {ticket.escalated && <span className="status-badge escalated" style={{ marginLeft: '0.4rem' }}>escalated</span>}
                  </td>
                  <td className="action-cell">
                    <Button variant="secondary" onClick={() => navigate(`/support/tickets/${ticket.id}/resolve`)}>View</Button>
                    {ticket.status !== 'resolved' && (
                      <>
                        <Button variant="primary" onClick={() => navigate(`/support/tickets/${ticket.id}/resolve`)}>Resolve</Button>
                        {!ticket.escalated && (
                          <Button variant="secondary" onClick={() => handleEscalate(ticket.id)}>Escalate</Button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No tickets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllTickets;
