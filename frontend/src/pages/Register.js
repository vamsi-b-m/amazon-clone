import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../App';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const addToast = useContext(ToastContext);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      addToast('Account created! Welcome to Amazon Clone 🎉');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
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
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ color: '#FF9900', fontSize: 36, fontWeight: 700 }}>amazon</span>
        </div>
        <div style={{ background: '#fff', borderRadius: 4, border: '1px solid var(--border)', padding: 28 }}>
          <h1 style={{ fontSize: 22, fontWeight: 400, marginBottom: 20 }}>Create account</h1>
          {error && (
            <div style={{ background: '#fff8f8', border: '1px solid #c40000', borderRadius: 4, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c40000' }}>
              ⚠️ {error}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            {[
              { key: 'name', label: 'Your name', type: 'text', placeholder: 'First and last name' },
              { key: 'email', label: 'Email', type: 'email', placeholder: '' },
              { key: 'password', label: 'Password', type: 'password', placeholder: 'At least 6 characters' },
              { key: 'confirm', label: 'Re-enter password', type: 'password', placeholder: '' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13, fontWeight: 600 }}>{f.label}</label>
                <input style={inputStyle} type={f.type} placeholder={f.placeholder}
                  value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} required />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-orange" style={{ width: '100%', padding: '9px 0', fontSize: 14, marginTop: 4 }}>
              {loading ? 'Creating account...' : 'Create your Amazon account'}
            </button>
          </form>
          <p style={{ fontSize: 11, color: '#565959', marginTop: 16, lineHeight: 1.6 }}>
            By creating an account, you agree to Amazon Clone's <a href="#" style={{ color: '#0066c0' }}>Conditions of Use</a> and <a href="#" style={{ color: '#0066c0' }}>Privacy Notice</a>.
          </p>
          <div style={{ borderTop: '1px solid var(--border)', marginTop: 16, paddingTop: 14, fontSize: 13 }}>
            Already have an account? <Link to="/login" style={{ color: '#0066c0' }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
