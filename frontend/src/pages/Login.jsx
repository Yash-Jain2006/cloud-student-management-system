import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Lock, User, ShieldCheck, GraduationCap } from 'lucide-react';
import AnimatedContainer, { HoverScale } from '../components/common/AnimatedContainer';
import API_BASE_URL from '../config';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loginType, setLoginType] = useState('student'); // 'student', 'faculty', 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          username: formData.username,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Server Error: Please check backend connectivity' }));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);

      // Fetch user profile to determine role and redirect
      const profileRes = await fetch(`${API_BASE_URL}/api/v1/users/me`, {
        headers: { 'Authorization': `Bearer ${data.access_token}` }
      });

      if (profileRes.ok) {
        const userData = await profileRes.json();
        const role = userData.role;

        // Smart Redirect based on Role
        if (role === 'admin') navigate('/admin');
        else if (role === 'faculty') navigate('/faculty');
        else navigate('/dashboard');
      } else {
        setError('Failed to retrieve user profile.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedContainer>
      <div className="flex-center" style={{ minHeight: 'calc(100vh - 120px)', padding: '1.5rem 0' }}>
        <div className="glass-card shine-effect" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div className="flex-center" style={{ 
              width: '64px', height: '64px', background: 'rgba(79, 70, 229, 0.1)', 
              borderRadius: '16px', margin: '0 auto 1.25rem auto', color: 'var(--primary)'
            }}>
              {loginType === 'admin' ? <ShieldCheck size={32} /> : 
               loginType === 'faculty' ? <GraduationCap size={32} /> : 
               <LogIn size={32} />}
            </div>
            <h1 style={{ fontSize: '1.85rem', fontWeight: '800', marginBottom: '0.4rem', letterSpacing: '-0.5px' }}>
              {loginType === 'admin' ? 'Admin Access' : 
               loginType === 'faculty' ? 'Faculty Portal' : 
               'Welcome Back'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Enter your credentials to continue</p>
          </div>

          {/* Role Switcher */}
          <div style={{ 
            display: 'flex', background: 'rgba(255,255,255,0.03)', 
            padding: '4px', borderRadius: '10px', marginBottom: '1.75rem',
            border: '1px solid var(--border-glass)'
          }}>
            {['student', 'faculty', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setLoginType(role)}
                style={{
                  flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '0.8rem', fontWeight: '600', textTransform: 'capitalize',
                  background: loginType === role ? 'var(--primary)' : 'transparent',
                  color: loginType === role ? 'white' : 'var(--text-dim)',
                  transition: 'all 0.2s ease'
                }}
              >
                {role}
              </button>
            ))}
          </div>

          {error && (
            <div className="pulse" style={{ 
              background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent)', 
              padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem',
              fontSize: '0.85rem', textAlign: 'center', border: '1px solid rgba(244, 63, 94, 0.2)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <User size={18} />
                </span>
                <input 
                  type="text" className="input-field" style={{ paddingLeft: '3rem', height: '48px' }}
                  placeholder={`${loginType} username`} required
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }}>
                  <Lock size={18} />
                </span>
                <input 
                  type="password" className="input-field" style={{ paddingLeft: '3rem', height: '48px' }}
                  placeholder="••••••••" required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <HoverScale>
              <button 
                type="submit" className="btn btn-primary" 
                style={{ width: '100%', marginTop: '0.75rem', height: '48px', fontSize: '1rem', fontWeight: '600' }} 
                disabled={loading}
              >
                {loading ? 'Authenticating...' : `Login as ${loginType}`}
              </button>
            </HoverScale>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Need access? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
          </p>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Login;
