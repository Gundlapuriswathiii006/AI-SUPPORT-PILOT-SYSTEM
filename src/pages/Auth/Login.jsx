import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.js';
import Loader from '../../components/common/Loader/index.jsx';


const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, setLoading, loading } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    try {
      setLoading(true);
      const user = await login(form);
      toast.success('Welcome back!');
      navigate(user.role === 'admin' ? '/admin' : user.role === 'support' ? '/support' : '/employee');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Signing you in..." />;

  return (
    <div className="sp-auth-screen">
      <div className="sp-auth-card row g-0"></div>
      
      <div className="sp-auth-card row g-0">
        <div className="col-lg-6 sp-auth-hero">
          <span className="sp-sidebar-kicker">SupportPilot</span>
          <h1 className="sp-hero-title">AI support operations, all in one place.</h1>
          <p className="sp-hero-copy">
            Track tickets, classify incidents, retrieve knowledge base guidance, and
            escalate before issues stall the business.
          </p>
          <div className="mt-4 d-flex flex-wrap gap-2">
            <span className="badge text-bg-info">JWT Auth</span>
            <span className="badge text-bg-secondary">RAG Search</span>
            <span className="badge text-bg-dark">Role Based Access</span>
          </div>
        </div>

        <div className="col-lg-6 sp-auth-form">
          <h2>Welcome back</h2>
          <p className="sp-page-copy">Sign in to your SupportPilot account to continue.</p>

          <form onSubmit={submit}>
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
              Sign in
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            New here?{' '}
            <Link to="/register" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Create an account
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
            <strong style={{ color: 'var(--text)' }}>Demo login</strong> — all demo accounts share one
            password: <code style={{ color: 'var(--cyan)' }}>SupportPilot@2025</code>
            <br />
            admin@supportpilot.ai · support@supportpilot.ai · employee@supportpilot.ai
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
