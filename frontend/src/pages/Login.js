import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const addToast = useContext(ToastContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      addToast('Welcome back bruhh! 👋');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 10px', border: '1px solid #888', borderRadius: 4,
    fontSize: 14, marginTop: 4, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#EAEDED', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ color: '#FF9900', fontSize: 36, fontWeight: 700 }}>amazon</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Sign in</h1>
          {error && (
            <div style={{ background: '#fff8f8', border: '1px solid #c40000', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c40000' }}>
              ⚠️ {error}
            </div>
          )}

          {/* Demo credentials hint */}
          <div style={{ background: '#f0f8ff', border: '1px solid #b0d4f1', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 12 }}>
            <strong>Demo credentials:</strong><br />
            Admin: admin@amazon.com / Admin@123<br />
            User: john@example.com / John@123
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Email or mobile phone number</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600 }}>Password</label>
              <input style={inputStyle} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '9px 0', fontSize: 14 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: '#565959', marginTop: 16, lineHeight: 1.6 }}>
            By signing in you agree to Amazon Clone's <a href="#" style={{ color: '#0066c0' }}>Conditions of Use</a> and <a href="#" style={{ color: '#0066c0' }}>Privacy Notice</a>.
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '16px 0', fontSize: 12, color: '#767676', position: 'relative' }}>
          <span style={{ background: '#EAEDED', padding: '0 12px', position: 'relative', zIndex: 1 }}>New to Amazon Clone?</span>
          <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#ccc', zIndex: 0 }} />
        </div>

        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: '12px 28px' }}>
          <Link to="/register">
            <button className="btn-secondary" style={{ width: '100%', padding: '9px 0', fontSize: 14 }}>
              Create your Amazon Clone account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
