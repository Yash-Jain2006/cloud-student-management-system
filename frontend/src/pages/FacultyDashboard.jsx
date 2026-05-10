import { useState, useEffect } from 'react';
import { BookOpen, Users, GraduationCap, ArrowRight, Calendar, UserCheck } from 'lucide-react';
import StatCard from '../components/common/StatCard';

const FacultyDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [coursesRes, statsRes] = await Promise.all([
          fetch('/api/v1/faculty/me/courses', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/faculty/me/stats', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex-center" style={{ height: '60vh' }}>Loading Instructor Portal...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <GraduationCap color="var(--primary)" size={36} /> Faculty Portal
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage your assigned courses and track student performance.</p>
      </header>

      {/* Stats Overview */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="My Courses" value={stats?.total_courses || 0} icon={BookOpen} color="#4f46e5" />
        <StatCard title="Total Students" value={stats?.total_students || 0} icon={Users} color="#10b981" />
        <StatCard title="Grading Pending" value="12" icon={ArrowRight} color="#f43f5e" />
        <StatCard title="Upcoming Classes" value="3" icon={Calendar} color="#0ea5e9" />
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Course Management */}
        <section>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>My Assignments</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {courses.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                You haven't been assigned any courses yet.
              </div>
            ) : (
              courses.map(course => (
                <div key={course.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>{course.title}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{course.description.substring(0, 80)}...</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn btn-glass" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <UserCheck size={16} /> Students
                    </button>
                    <button className="btn btn-primary">Manage</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Sidebar: Notifications & Tools */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Instructor Tools</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button className="btn btn-glass" style={{ width: '100%', textAlign: 'left' }}>Upload Lecture Notes</button>
              <button className="btn btn-glass" style={{ width: '100%', textAlign: 'left' }}>Create Assignment</button>
              <button className="btn btn-glass" style={{ width: '100%', textAlign: 'left' }}>View Gradebook</button>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Enrollments</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No new enrollments in the last 24h.</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default FacultyDashboard;
