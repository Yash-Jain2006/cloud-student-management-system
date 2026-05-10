import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, GraduationCap } from 'lucide-react';
import AnimatedContainer from '../components/common/AnimatedContainer';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordMismatch = useMemo(
    () => formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword,
    [formData.password, formData.confirmPassword]
  );

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (passwordMismatch) {
        throw new Error('Passwords do not match.');
      }
      if (formData.password.length > 72) {
        throw new Error('Password must be 72 characters or fewer.');
      }

      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      setSuccess('Registration successful. Redirecting to login...');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedContainer>
      <div className="flex-center" style={{ minHeight: '80vh' }}>
        <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <div
              className="flex-center"
              style={{
                width: '60px',
                height: '60px',
                background: 'rgba(79, 70, 229, 0.12)',
                borderRadius: '15px',
                margin: '0 auto 1rem auto',
              }}
            >
              <UserPlus size={30} color="var(--primary)" />
            </div>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '0.45rem' }}>Create Your Account</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>Register to access courses and uploads.</p>
          </div>

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-dim)', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                <User size={16} /> Username
              </span>
              <input
                type="text"
                className="input-field"
                placeholder="Choose a username"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </label>

            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-dim)', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                <Mail size={16} /> Email Address
              </span>
              <input
                type="email"
                className="input-field"
                placeholder="name@university.edu"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </label>

            <label>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-dim)', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                <GraduationCap size={16} /> Role
              </span>
              <select
                className="input-field"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-dim)', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                  <Lock size={16} /> Password
                </span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Create password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </label>

              <label>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-dim)', fontSize: '0.86rem', marginBottom: '0.4rem' }}>
                  <Lock size={16} /> Confirm Password
                </span>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </label>
            </div>

            {passwordMismatch && (
              <p style={{ color: 'var(--accent)', fontSize: '0.82rem' }}>Passwords do not match.</p>
            )}
            {error && <p style={{ color: 'var(--accent)', fontSize: '0.85rem' }}>{error}</p>}
            {success && <p style={{ color: '#10b981', fontSize: '0.85rem' }}>{success}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.35rem' }}
              disabled={loading || passwordMismatch}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Register;
