import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ticketService } from '../../services/ticketService';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    resolved: 0,
    escalated: 0,
    avgResolution: 0,
  });
  const [chartData, setChartData] = useState({
    ticketTrend: [],
    resolutionTrend: [],
  });

  useEffect(() => {
  ticketService.getAllTickets()
      .then((tickets) => {
        if (!Array.isArray(tickets)) return;
        const open = tickets.filter((t) => t.status === 'open').length;
        const resolved = tickets.filter((t) => t.status === 'resolved').length;
        const escalated = tickets.filter((t) => t.status === 'escalated').length;

        const resolvedWithTimes = tickets.filter((t) => t.resolvedAt && t.createdAt);
        const avgResolution = resolvedWithTimes.length
          ? resolvedWithTimes.reduce((sum, t) => sum + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) /
            resolvedWithTimes.length / (1000 * 60 * 60)
          : 0;

        setStats({
          total: tickets.length,
          open,
          resolved,
          escalated,
          avgResolution,
        });

        // Ticket Trend: tickets created per day (last 7 days with data)
        const trendMap = {};
        tickets.forEach((t) => {
          if (!t.createdAt) return;
          const day = new Date(t.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          trendMap[day] = (trendMap[day] || 0) + 1;
        });
        const ticketTrend = Object.entries(trendMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-7)
          .map(([name, value]) => ({ name, value }));

        // Resolution Rate: tickets resolved per day (last 7 days with data)
        const resolvedMap = {};
        tickets
          .filter((t) => t.status === 'resolved' && t.resolvedAt)
          .forEach((t) => {
            const day = new Date(t.resolvedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            resolvedMap[day] = (resolvedMap[day] || 0) + 1;
          });
        const resolutionTrend = Object.entries(resolvedMap)
          .sort((a, b) => new Date(a[0]) - new Date(b[0]))
          .slice(-7)
          .map(([name, value]) => ({ name, value }));

        setChartData({
          ticketTrend: ticketTrend.length ? ticketTrend : [{ name: '', value: 0 }],
          resolutionTrend: resolutionTrend.length ? resolutionTrend : [{ name: '', value: 0 }],
        });
      })
      .catch(() => {/* no backend — keep zeros */});
  }, []);

  const statCards = [
    { label: 'Total Tickets', sub: 'All your requests', value: stats.total, color: 'var(--cyan)' },
    { label: 'Open Tickets', sub: 'Waiting on resolution', value: stats.open, color: 'var(--yellow)' },
    { label: 'Resolved Tickets', sub: 'Closed successfully', value: stats.resolved, color: 'var(--green)' },
    { label: 'Escalated Tickets', sub: 'Needs human review', value: stats.escalated, color: 'var(--red)' },
  ];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Hero banner */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '2rem 2rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-muted)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid var(--border-strong)',
              borderRadius: '999px',
              padding: '0.2rem 0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            Employee workspace
          </span>
          <h1
            style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: 'var(--text)',
              letterSpacing: '-0.5px',
              marginBottom: '0.4rem',
            }}
          >
            Track your tickets and get AI guidance instantly.
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Use the dashboard to create issues, follow status changes, and read suggested fixes.
          </p>
        </div>
        <button
          className="sp-btn"
          onClick={() => navigate('/employee/tickets/new')}
          style={{ background: 'var(--cyan)', color: '#fff', border: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
        >
          Create Ticket
        </button>
      </div>

      {/* Stat cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        {statCards.map(({ label, sub, value, color }) => (
          <div
            key={label}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '1.3rem 1.5rem',
              display: 'flex',
              gap: '1rem',
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 4,
                alignSelf: 'stretch',
                borderRadius: 4,
                background: color,
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{label}</div>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{sub}</div>
            </div>
          </div>
        ))}

        {/* Avg Resolution Time */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.3rem 1.5rem',
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-start',
          }}
        >
          <div
            style={{
              width: 4,
              alignSelf: 'stretch',
              borderRadius: 4,
              background: 'var(--text-dim)',
              flexShrink: 0,
            }}
          />
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>Avg Resolution Time</div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>
              {stats.avgResolution.toFixed(1)}h
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Average turnaround</div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {/* Ticket Trend */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            Ticket Trend
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData.ticketTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Line type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Resolution Rate */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1rem' }}>
            Resolution Rate
          </h2>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={chartData.resolutionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-dim)', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
              <Line type="monotone" dataKey="value" stroke="var(--green)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}