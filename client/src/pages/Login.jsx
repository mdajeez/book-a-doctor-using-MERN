import { useState, useRef, useEffect } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const validate = () => {
    if (!form.email.trim()) return 'Email is required';
    if (!form.password) return 'Password is required';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (v) return setError(v);
    setLoading(true);
    try {
      // Server will set httpOnly cookie or respond requires2FA
      const res = await API.post('/auth/login', { email: form.email, password: form.password });
      const { role, status, requires2FA } = res.data || {};

      if (requires2FA) {
        // navigate to two-factor page where user will enter OTP
        return navigate('/two-factor', { state: { email: form.email } });
      }

      // store only non-sensitive UI info
      if (role) localStorage.setItem('role', role);
      if (status) localStorage.setItem('status', status);

      // redirect based on role
      if (role === 'doctor') navigate('/doctor-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
      else navigate('/patient-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #a78bfa 0%, #14b8a6 100%)',
    },
    card: {
      background: 'rgba(248,250,252,0.85)',
      boxShadow: '0 8px 32px 0 rgba(31,38,135,0.15)',
      borderRadius: '20px',
      padding: '40px 32px',
      width: '100%',
      maxWidth: '400px',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      border: '1px solid rgba(255,255,255,0.18)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    title: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#7c3aed',
      marginBottom: '8px',
      letterSpacing: '1px',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: '1rem',
      color: '#0d9488',
      marginBottom: '24px',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      padding: '12px',
      marginBottom: '16px',
      borderRadius: '10px',
      border: '1px solid #c4b5fd',
      fontSize: '1rem',
      background: '#f5f3ff',
      color: '#312e81',
      outline: 'none',
      transition: 'border 0.2s',
    },
    button: {
      width: '100%',
      padding: '12px',
      borderRadius: '10px',
      background: 'linear-gradient(90deg,#7c3aed,#14b8a6)',
      color: '#fff',
      fontWeight: 600,
      fontSize: '1rem',
      border: 'none',
      cursor: 'pointer',
      marginTop: '8px',
      boxShadow: '0 2px 8px rgba(31,38,135,0.10)',
      transition: 'background 0.2s',
    },
    error: {
      color: '#ef4444',
      marginBottom: '12px',
      textAlign: 'center',
    },
    link: {
      color: '#7c3aed',
      textDecoration: 'underline',
      cursor: 'pointer',
      marginTop: '12px',
      fontSize: '0.95rem',
      textAlign: 'center',
    },
  };
  
  
  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleSubmit}>
        <div style={styles.title}>Welcome Back</div>
        <div style={styles.subtitle}>Sign in to your HealthEase Portal account</div>
        {error && <div style={styles.error}>{error}</div>}
        <input ref={emailRef} style={styles.input} type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} autoComplete="username" />
        <div style={{ position: 'relative', width: '100%' }}>
          <input style={{ ...styles.input, paddingRight: 40 }} type={showPassword ? 'text' : 'password'} name="password" placeholder="Password" value={form.password} onChange={handleChange} autoComplete="current-password" />
          <button type="button" style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', fontSize: 18 }} onClick={() => setShowPassword((s) => !s)}>
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 8, width: '100%' }}>
          <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} style={{ accentColor: '#7c3aed', width: 18, height: 18, margin: 0 }} />
          <span style={{ fontSize: 15, color: '#6b7280', fontWeight: 500, letterSpacing: '0.2px' }}>Remember me</span>
        </label>
        <button type="submit" style={styles.button} disabled={loading}>{loading ? 'Signing in...' : 'Login'}</button>
        <span style={styles.link} onClick={() => navigate('/forgot-password')}>Forgot password?</span>
        <span style={styles.link} onClick={() => navigate('/register')}>Create account</span>
        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <button type="button" onClick={() => navigate('/admin-login')} style={{ background: 'none', border: '1px solid #7c3aed', color: '#7c3aed', padding: '8px 18px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', marginTop: '8px' }}>
            Admin Login
          </button>
        </div>
      </form>
    </div>
  );
}
