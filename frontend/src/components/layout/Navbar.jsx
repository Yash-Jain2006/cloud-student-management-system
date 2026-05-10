import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="glass-card" style={{ 
      margin: '1rem', 
      padding: '0.75rem 2rem', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      position: 'sticky',
      top: '1rem',
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
          borderRadius: '8px' 
        }}></div>
        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>EduCloud</h2>
      </div>
      
      {localStorage.getItem('token') && !['/login', '/register'].includes(window.location.pathname) && (
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Dashboard</Link>
          <Link to="/courses" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Courses</Link>
          <Link to="/profile" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem' }}>Profile</Link>
          <button onClick={handleLogout} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Logout</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
