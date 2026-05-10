import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Shield, BarChart3, Save } from 'lucide-react';
import AnimatedContainer from '../components/common/AnimatedContainer';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('/api/v1/users/me', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) {
          throw new Error('Unable to load profile');
        }
        const data = await res.json();
        setUser(data);
        setFormData({
          username: data.username || '',
          email: data.email || '',
          password: '',
        });
      } catch (err) {
        setError(err.message || 'Unable to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {};
      if (formData.username.trim() && formData.username !== user.username) payload.username = formData.username.trim();
      if (formData.email.trim() && formData.email !== user.email) payload.email = formData.email.trim();
      if (formData.password) payload.password = formData.password;

      if (Object.keys(payload).length === 0) {
        setSuccess('No changes to save.');
        setSaving(false);
        return;
      }

      const res = await fetch('/api/v1/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || 'Unable to update profile');
      }

      setUser(data);
      setFormData((prev) => ({ ...prev, password: '' }));
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex-center" style={{ height: '60vh' }}>Loading Profile...</div>;
  }

  return (
    <AnimatedContainer>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <section>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.45rem' }}>Profile</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your account details and review your learning stats.</p>
        </section>

        {error && (
          <div className="glass-card" style={{ padding: '1rem', color: 'var(--accent)' }}>{error}</div>
        )}
        {success && (
          <div className="glass-card" style={{ padding: '1rem', color: '#10b981' }}>{success}</div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Account Information</h2>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <label style={{ display: 'block' }}>
                <span style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--text-dim)' }}>
                  <User size={16} /> Username
                </span>
                <input
                  className="input-field"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--text-dim)' }}>
                  <Mail size={16} /> Email
                </span>
                <input
                  className="input-field"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </label>

              <label style={{ display: 'block' }}>
                <span style={{ display: 'flex', gap: '0.55rem', alignItems: 'center', marginBottom: '0.4rem', color: 'var(--text-dim)' }}>
                  <Shield size={16} /> New Password (optional)
                </span>
                <input
                  className="input-field"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
              </label>

              <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: '0.4rem' }}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', gap: '0.55rem', alignItems: 'center' }}>
              <BarChart3 size={18} /> Academic Stats
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <p><span style={{ color: 'var(--text-dim)' }}>Role:</span> <strong style={{ textTransform: 'capitalize' }}>{user?.role || '-'}</strong></p>
              <p><span style={{ color: 'var(--text-dim)' }}>Total Courses:</span> <strong>{user?.stats?.total_courses ?? 0}</strong></p>
              <p><span style={{ color: 'var(--text-dim)' }}>Average Progress:</span> <strong>{user?.stats?.avg_progress ?? 0}%</strong></p>
              <p><span style={{ color: 'var(--text-dim)' }}>Active Courses:</span> <strong>{user?.stats?.active_courses ?? 0}</strong></p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  );
};

export default Profile;
