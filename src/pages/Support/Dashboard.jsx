import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ticketService } from '../../services/ticketService';

function Dashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    ticketService.getAllTickets()
      .then((data) => {
        if (active && Array.isArray(data)) setTickets(data);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  const open = tickets.filter((t) => t.status === 'open').length;
  const resolved = tickets.filter((t) => t.status === 'resolved').length;
  const escalated = tickets.filter((t) => t.escalated).length;

  const resolvedWithTimes = tickets.filter((t) => t.resolvedAt && t.createdAt);
  const avgResolutionHours = resolvedWithTimes.length
    ? resolvedWithTimes.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) /
      resolvedWithTimes.length / (1000 * 60 * 60)
    : 0;

  const recentTickets = [...tickets]
    .sort((a, b) => new Date(b.createdAtISO || b.createdAt) - new Date(a.createdAtISO || a.createdAt))
    .slice(0, 5);

  return (
    <div className="admin-dashboard">
      <div className="welcome-banner">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>Here's what's happening with your tickets today.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🎫</div>
          <div className="stat-info">
            <h3>{tickets.length}</h3>
            <p>Total Tickets</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">🔓</div>
          <div className="stat-info">
            <h3>{open}</h3>
            <p>Open Tickets</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{resolved}</h3>
            <p>Resolved Tickets</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{escalated}</h3>
            <p>Escalated</p>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>{avgResolutionHours ? `${avgResolutionHours.toFixed(1)}h` : '—'}</h3>
            <p>Avg. Resolution Time</p>
          </div>
        </div>
      </div>

      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Tickets</h2>
          <Link to="/support/tickets" className="view-all-link">View All →</Link>
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
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.length > 0 ? (
                recentTickets.map((ticket) => (
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
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td>{ticket.createdAt}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">No tickets found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="quick-links-section">
        <h2>Quick Actions</h2>
        <div className="quick-links-grid">
          <Link to="/support/tickets" className="quick-link-card">
            <span>🎫</span>
            <p>All Tickets</p>
          </Link>
          <Link to="/support/escalations" className="quick-link-card">
            <span>⚠️</span>
            <p>Escalations</p>
          </Link>
          <Link to="/support/analytics" className="quick-link-card">
            <span>📊</span>
            <p>Analytics</p>
          </Link>
          <Link to="/support/profile" className="quick-link-card">
            <span>👤</span>
            <p>Profile</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
