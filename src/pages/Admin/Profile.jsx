import { useAuth } from '../../hooks/useAuth.js';

export default function AdminProfile() {
  const { user } = useAuth();

  return (
    <div>
      <div className="sp-page-header">
        <h1>Admin Profile</h1>
      </div>
      <div className="sp-card" style={{ maxWidth: '500px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--purple), var(--accent))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.6rem', fontWeight: 800, color: '#fff',
          }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontWeight: 800, color: 'var(--text)', marginBottom: '0.2rem' }}>{user?.name}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{user?.email}</p>
            <span className="priority-badge" style={{ marginTop: '0.35rem', background: 'rgba(139,92,246,0.15)', color: 'var(--purple)', border: '1px solid rgba(139,92,246,0.25)' }}>Administrator</span>
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          System administrator account. Full access to all platform features.
        </p>
      </div>
    </div>
  );
}
