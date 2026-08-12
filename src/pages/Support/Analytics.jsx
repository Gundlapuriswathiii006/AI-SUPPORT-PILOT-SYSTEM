import React, { useEffect, useState } from 'react';
import { ticketService } from '../../services/ticketService';
import Loader from '../../components/common/Loader';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function Analytics() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ticketService.getAllTickets()
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader text="Loading analytics..." />;

  const today = new Date().toDateString();

  const ticketsToday = tickets.filter(
    (t) =>
      new Date(t.createdAtISO || t.createdAt).toDateString() === today
  ).length;

  const resolved = tickets.filter(
    (t) => t.status === 'resolved'
  ).length;

  const escalated = tickets.filter(
    (t) => t.escalated
  ).length;

  const metrics = [
    { label: 'Tickets Today', value: ticketsToday },
    { label: 'Resolved', value: resolved },
    { label: 'Escalated', value: escalated },
  ];

  // Ticket volume for the last 7 days
  const now = new Date();

  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - i));

    const count = tickets.filter(
      (t) =>
        new Date(t.createdAtISO || t.createdAt).toDateString() ===
        day.toDateString()
    ).length;

    return {
      label: DAY_LABELS[day.getDay()],
      count,
    };
  });

  const maxCount = Math.max(
    1,
    ...weeklyData.map((d) => d.count)
  );

  return (
    <div className="knowledge-base">
      <div className="section-header">
        <h1>Analytics</h1>
      </div>

      <p
        style={{
          color: 'var(--text-muted)',
          marginBottom: '1.5rem',
        }}
      >
        Team performance and ticket trends at a glance.
      </p>

      <div className="stats-grid">
        {metrics.map((metric) => (
          <div key={metric.label} className="stat-card blue">
            <div className="stat-info">
              <p>{metric.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="kb-card">
        <h3 style={{ marginBottom: '1rem' }}>
          Ticket Volume — Last 7 Days
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.75rem',
            height: '160px',
          }}
        >
          {weeklyData.map((d) => (
            <div
              key={d.label}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                gap: '0.4rem',
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '32px',
                  height: `${(d.count / maxCount) * 120}px`,
                  minHeight: d.count > 0 ? '4px' : '0',
                  background: 'var(--cyan)',
                  borderRadius: '4px 4px 0 0',
                }}
              />

              <small style={{ color: 'var(--text-dim)' }}>
                {d.label}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Analytics;