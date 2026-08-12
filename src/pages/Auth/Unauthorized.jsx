import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';

const Unauthorized = () => {
  const { user } = useAuth();
  const home = user?.role === 'admin' ? '/admin' : user?.role === 'support' ? '/support' : user ? '/employee' : '/login';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-root)',
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>🚫</div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
        Access Denied
      </h1>
      <p style={{ color: 'var(--text-muted)', maxWidth: '400px', marginBottom: '2rem' }}>
        You don't have permission to view this page. Please contact your administrator
        if you think this is a mistake.
      </p>
      <Link to={home} className="sp-btn sp-btn-primary">
        Go to my dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;
