import Navbar from './Navbar';

const MainLayout = ({ children }) => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main className="container" style={{ flex: 1, padding: '2rem 0' }}>
        {children}
      </main>
      <footer style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: 'var(--text-dim)', 
        fontSize: '0.8rem',
        borderTop: '1px solid var(--border-glass)',
        marginTop: 'auto'
      }}>
        © 2026 EduCloud Student Management System. Built with React & FastAPI.
      </footer>
    </div>
  );
};

export default MainLayout;
