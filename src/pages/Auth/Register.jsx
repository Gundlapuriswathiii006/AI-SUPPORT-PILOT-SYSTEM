import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../hooks/useAuth.js';
import { authService } from '../../services/authService.js';
import Loader from '../../components/common/Loader/index.jsx';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
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
      await authService.register(form);
      const user = await login({ email: form.email, password: form.password });
      toast.success('Account created! Welcome to SupportPilot.');
      navigate(user.role === 'admin' ? '/admin' : user.role === 'support' ? '/support' : '/employee');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Creating your account..." />;

  return (
    <div className="sp-auth-screen">
      <div className="sp-auth-card row g-0">
        <div className="col-lg-6 sp-auth-hero">
          <span className="sp-sidebar-kicker">Join SupportPilot</span>
          <h1 className="sp-hero-title">A faster support workflow starts here.</h1>
          <p className="sp-hero-copy">
            Register to create and manage tickets with AI-assisted classification
            and automated response generation.
          </p>
          <div className="mt-4 d-flex flex-wrap gap-2">
            <span className="badge text-bg-info">AI Classification</span>
            <span className="badge text-bg-secondary">Smart Routing</span>
            <span className="badge text-bg-dark">SLA Tracking</span>
          </div>
        </div>

        <div className="col-lg-6 sp-auth-form">
          <h2>Create account</h2>
          <p className="sp-page-copy">Get started with SupportPilot in seconds.</p>

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
            <div className="sp-input-group">
              <label htmlFor="role">Role</label>
              <select
                id="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="employee">Employee</option>
                <option value="support">Support Engineer</option>
              </select>
              <p style={{ marginTop: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                Administrator accounts can only be created by an existing admin.
              </p>
            </div>
            <button
              className="sp-btn sp-btn-primary w-100"
              type="submit"
              style={{ marginTop: '0.5rem', padding: '0.7rem', fontSize: '0.95rem' }}
            >
              Create account
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Already registered?{' '}
            <Link to="/login" style={{ color: 'var(--cyan)', fontWeight: 600 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
