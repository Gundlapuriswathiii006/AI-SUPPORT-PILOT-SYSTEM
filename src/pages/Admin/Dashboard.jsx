import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import adminService from '../../services/adminService'


function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTickets, setRecentTickets] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, tickets] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentTickets()
        ])
        setStats(statsData)
        setRecentTickets(tickets)
      } catch (error) {
        console.error('Failed to load dashboard data', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="loading">Loading dashboard...</div>
  }

  return (
    <div className="admin-dashboard">

      {/* Welcome */}
      <div className="welcome-banner">
        <h1>Welcome back, {user?.name} 👋</h1>
        <p>Here's what's happening in the system today.</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🎫</div>
          <div className="stat-info">
            <h3>{stats?.totalTickets ?? 0}</h3>
            <p>Total Tickets</p>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">🔓</div>
          <div className="stat-info">
            <h3>{stats?.openTickets ?? 0}</h3>
            <p>Open Tickets</p>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats?.resolvedTickets ?? 0}</h3>
            <p>Resolved Tickets</p>
          </div>
        </div>

        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-info">
            <h3>{stats?.slaBreached ?? 0}</h3>
            <p>SLA Breached</p>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats?.totalUsers ?? 0}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card teal">
          <div className="stat-icon">🤖</div>
          <div className="stat-info">
            <h3>{stats?.aiResolved ?? 0}</h3>
            <p>AI Auto-Resolved</p>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Recent Tickets</h2>
          <Link to="/admin/tickets" className="view-all-link">View All →</Link>
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
                    <td>{ticket.title}</td>
                    <td>{ticket.raisedBy}</td>
                    <td>
                      <span className={`priority-badge ${ticket.priority}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${ticket.status}`}>
                        {ticket.status.replace('_', ' ')}
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

      {/* Quick Links */}
      <div className="quick-links-section">
        <h2>Quick Actions</h2>
        <div className="quick-links-grid">
          <Link to="/admin/users" className="quick-link-card">
            <span>👤</span>
            <p>Manage Users</p>
          </Link>
          <Link to="/admin/tickets" className="quick-link-card">
            <span>🎫</span>
            <p>Monitor Tickets</p>
          </Link>
          <Link to="/admin/reports" className="quick-link-card">
            <span>📊</span>
            <p>View Reports</p>
          </Link>
          <Link to="/admin/knowledge-base" className="quick-link-card">
            <span>📚</span>
            <p>Knowledge Base</p>
          </Link>
          <Link to="/admin/settings" className="quick-link-card">
            <span>⚙️</span>
            <p>System Settings</p>
          </Link>
        </div>
      </div>

    </div>
  )
}

export default Dashboard