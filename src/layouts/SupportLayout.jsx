import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import ThemeToggle from '../components/ThemeToggle/index.jsx';

const supportLinks = [
  { to: '/support', label: 'Dashboard', end: true },
  { to: '/support/tickets', label: 'All Tickets' },
 
  { to: '/support/analytics', label: 'Analytics' },
  { to: '/support/escalations', label: 'Escalations' },
  { to: '/support/knowledge-base', label: 'Knowledge Base' },
  { to: '/support/profile', label: 'Profile' },
];

export default function SupportLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'S';
  const firstName = user?.name ? user.name.split(' ')[0] : 'Support';

  return (
    <div className="sp-app-shell">
      <aside className={`sp-sidebar${mobileNavOpen ? ' is-open' : ''}`}>
        <div className="sp-sidebar-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Workspace</span>
          <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px' }}>SUPPORT</span>
        </div>
        <nav className="sp-sidebar-nav">
          {supportLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => 'sp-sidebar-link' + (isActive ? ' active' : '')}>{label}</NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile backdrop — click to close the nav */}
      {mobileNavOpen && (
        <div
          className="sp-sidebar-backdrop"
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 40 }}
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <header className="sp-navbar">
        <div>
          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', lineHeight: 1.2 }}>SupportPilot</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '1px' }}>AI-powered support operations</div>
        </div>
        <div className="sp-navbar-right">
          <button
            type="button"
            className="sp-mobile-nav-toggle"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileNavOpen((v) => !v)}
          >
            ☰
          </button>
          <ThemeToggle />
          <div className="sp-user-chip">
            <div className="sp-user-avatar">{initials}</div>
            <span>{firstName}</span>
          </div>
          <button className="sp-btn sp-btn-secondary sp-btn-sm" onClick={() => navigate('/support')}>Dashboard</button>
          <button className="sp-btn sp-btn-sm" onClick={handleLogout} style={{ background: 'var(--cyan)', color: '#fff', border: 'none' }}>Logout</button>
        </div>
      </header>

      <main className="sp-main"><Outlet /></main>
    </div>
  );
}
