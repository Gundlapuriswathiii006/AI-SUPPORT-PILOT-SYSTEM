import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

function TicketMonitoring() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    setLoading(true);
    try {
      const [ticketData, userData] = await Promise.all([
        adminService.getAllTickets(),
        adminService.getAllUsers(),
      ]);
      setTickets(ticketData);
      setUsers(userData.filter((u) => u.role === 'support'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleEscalate = async (ticketId) => {
    await adminService.escalateTicket(ticketId);
    toast.success('Ticket escalated.');
    load();
  };

  const handleReassign = async (ticketId, agentId) => {
    if (!agentId) return;
    await adminService.reassignTicket(ticketId, agentId);
    toast.success('Ticket reassigned.');
    load();
  };

  if (loading) return <Loader text="Loading tickets..." />;

  const visibleTickets = statusFilter === 'all' ? tickets : tickets.filter((t) => t.status === statusFilter);

  return (
    <div className="ticket-monitoring">
      <div className="section-header">
        <h1>Ticket Monitoring</h1>
        <div className="range-filters">
          {['all', 'open', 'resolved'].map((value) => (
            <Button
              key={value}
              variant={statusFilter === value ? 'primary' : 'secondary'}
              onClick={() => setStatusFilter(value)}
            >
              {value === 'all' ? 'All' : value === 'open' ? 'Open' : 'Resolved'}
            </Button>
          ))}
        </div>
      </div>

      <div className="table-wrapper">
        <table className="ticket-table">
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>Title</th>
              <th>Raised By</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTickets.length > 0 ? (
              visibleTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td>#{ticket.id}</td>
                  <td>{ticket.title || ticket.subject}</td>
                  <td>{ticket.raisedBy || 'Unknown'}</td>
                  <td>
                    <span className={`priority-badge ${(ticket.priority || '').toLowerCase()}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ticket.status}`}>{ticket.status?.replace('_', ' ')}</span>
                    {ticket.escalated && <span className="status-badge escalated" style={{ marginLeft: '0.4rem' }}>escalated</span>}
                  </td>
                  <td>
                    <select
                      value={ticket.assignedTo || ''}
                      onChange={(e) => handleReassign(ticket.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="action-cell">
                    {!ticket.escalated && ticket.status !== 'resolved' && (
                      <Button variant="secondary" onClick={() => handleEscalate(ticket.id)}>Escalate</Button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">No tickets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TicketMonitoring;
