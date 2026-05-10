import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, BookOpen, Users, LayoutDashboard, BarChart3, PieChart as PieIcon } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { PopularityChart, UserPieChart } from '../components/admin/AnalyticsChart';

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [coursesRes, statsRes] = await Promise.all([
          fetch('/api/v1/courses/', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/analytics/summary', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        if (coursesRes.ok) setCourses(await coursesRes.json());
        if (statsRes.ok) setAnalytics(await statsRes.json());
      } catch (err) { console.error(err); }
    };
    
    fetchData();
  }, [refreshTrigger]);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/courses/', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({ title: '', description: '' });
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <LayoutDashboard color="var(--primary)" /> Admin Console
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your university's courses and academic content.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Create New Course
        </button>
      </header>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard title="Total Courses" value={courses.length} icon={BookOpen} color="#4f46e5" />
        <StatCard title="Total Enrollments" value={analytics?.total_enrollments || 0} icon={Users} color="#10b981" />
        <StatCard title="Active Faculty" value="24" icon={BarChart3} color="#f43f5e" />
        <StatCard title="Total Files" value="142" icon={PieIcon} color="#0ea5e9" />
      </div>

      {/* Analytics Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
        {analytics?.popularity && <PopularityChart data={analytics.popularity} />}
        {analytics?.user_breakdown && <UserPieChart data={analytics.user_breakdown} />}
      </div>

      {/* Active Courses Table */}
      <section className="glass-card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-glass)' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Active Courses</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                <th style={{ padding: '1rem 1.5rem' }}>COURSE TITLE</th>
                <th style={{ padding: '1rem 1.5rem' }}>DESCRIPTION</th>
                <th style={{ padding: '1rem 1.5rem' }}>INSTRUCTOR</th>
                <th style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(course => (
                <tr key={course.id} style={{ borderTop: '1px solid var(--border-glass)', fontSize: '0.9rem' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{course.title}</td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{course.description}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>Admin #{course.instructor_id}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                      <button className="btn btn-glass" style={{ padding: '0.4rem' }}><Edit size={16} /></button>
                      <button className="btn btn-glass" style={{ padding: '0.4rem', color: 'var(--accent)' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showForm && (
        <div className="flex-center" style={{ 
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
          background: 'rgba(0,0,0,0.8)', zIndex: 1000, backdropFilter: 'blur(8px)' 
        }}>
          <div className="glass-card" style={{ width: '400px', padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem' }}>New Course</h2>
            <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input 
                className="input-field" placeholder="Course Title" required 
                value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
              />
              <textarea 
                className="input-field" placeholder="Course Description" rows="4" 
                value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
              />
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-glass" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
