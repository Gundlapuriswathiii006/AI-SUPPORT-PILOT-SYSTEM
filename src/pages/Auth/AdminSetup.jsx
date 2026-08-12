import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.js';
import { authService } from '../../services/authService.js';
import Loader from '../../components/common/Loader/index.jsx';

// Hidden setup page — reachable only by typing /admin-setup directly.
// Not linked from any nav, login, or register page.
const AdminSetupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const { login, setLoading, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    try {
      setLoading(true);
      await authService.registerAdmin(form);
      await login({ email: form.email, password: form.password });
      toast.success('Administrator account created.');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not create administrator account.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Creating administrator account..." />;

  return (
    <div className="sp-auth-screen">
      <div className="sp-auth-card row g-0">
        <div className="col-lg-6 sp-auth-hero">
          <span className="sp-sidebar-kicker">Restricted</span>
          <h1 className="sp-hero-title">Administrator setup</h1>
          <p className="sp-hero-copy">
            This page creates an Administrator account for SupportPilot. It is not linked
            from anywhere in the app — only share this URL with people who should have admin access.
          </p>
        </div>

        <div className="col-lg-6 sp-auth-form">
          <h2>Create administrator account</h2>
          <p className="sp-page-copy">This account will have full access to Users, Tickets, Reports and Settings.</p>

          <form onSubmit={submit}>
            <div className="sp-input-group">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="Jane Doe"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sp-input-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="sp-input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <button
              className="sp-btn sp-btn-primary w-100"
              type="submit"
              style={{ marginTop: '0.5rem', padding: '0.7rem', fontSize: '0.95rem' }}
            >
              Create administrator account
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already have an admin account?{' '}
            <Link to="/admin/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Sign in here
            </Link>
          </p>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
            Not an admin?{' '}
            <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Go to regular sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSetupPage;
