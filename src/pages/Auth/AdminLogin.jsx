import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.js';
import Loader from '../../components/common/Loader/index.jsx';
import ThemeToggle from '../../components/ThemeToggle/index.jsx';

/**
 * Dedicated admin sign-in screen.
 *
 * The regular /login page already accepts admin accounts and redirects
 * based on role — this page exists as a separate, clearly-labeled entry
 * point for admins specifically (linked from Admin Setup / Register),
 * and it rejects non-admin accounts instead of silently routing them
 * to their own dashboard.
 */
const AdminLoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, setLoading, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const user = await login(form);
      if (user.role !== 'admin') {
        toast.error('This sign-in page is for administrators only. Use the regular login page for your account.');
        return;
      }
      toast.success('Welcome back, admin!');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Signing you in..." />;

  return (
    <div className="sp-auth-screen">
      <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }}>
        <ThemeToggle />
      </div>
      <div className="sp-auth-card row g-0">
        <div className="col-lg-6 sp-auth-hero">
          <span className="sp-sidebar-kicker">SupportPilot · Admin</span>
          <h1 className="sp-hero-title">Administrator access.</h1>
          <p className="sp-hero-copy">
            Manage users, monitor tickets across the organization, configure the knowledge
            base, and review system-wide reports.
          </p>
          <div className="mt-4 d-flex flex-wrap gap-2">
            <span className="badge text-bg-info">JWT Auth</span>
            <span className="badge text-bg-secondary">Role Restricted</span>
            <span className="badge text-bg-dark">Full Oversight</span>
          </div>
        </div>

        <div className="col-lg-6 sp-auth-form">
          <h2>Admin sign in</h2>
          <p className="sp-page-copy">This page is restricted to administrator accounts.</p>

          <form onSubmit={submit}>
            <div className="sp-input-group">
              <label htmlFor="admin-email">Admin email</label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="sp-input-group">
              <label htmlFor="admin-password">Password</label>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              className="sp-btn sp-btn-primary w-100"
              type="submit"
              style={{ marginTop: '0.5rem', padding: '0.7rem', fontSize: '0.95rem' }}
            >
              Sign in as admin
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Setting up the first admin account?{' '}
            <Link to="/admin-setup" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Register an admin
            </Link>
          </p>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Not an admin?{' '}
            <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Go to regular login
            </Link>
          </p>

          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-strong)',
              background: 'var(--bg-input)',
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
            }}
          >
            <strong style={{ color: 'var(--text)' }}>Demo login</strong> —{' '}
            <code style={{ color: 'var(--cyan)' }}>admin@supportpilot.ai</code> /{' '}
            <code style={{ color: 'var(--cyan)' }}>SupportPilot@2025</code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
