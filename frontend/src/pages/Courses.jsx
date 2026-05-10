import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, CheckCircle, ArrowRight } from 'lucide-react';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      try {
        const [allRes, enrolledRes] = await Promise.all([
          fetch('/api/v1/courses/', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/v1/courses/enrolled', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        if (allRes.ok && enrolledRes.ok) {
          setCourses(await allRes.json());
          const enrolledData = await enrolledRes.json();
          setEnrolledIds(enrolledData.map(c => c.id));
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleEnroll = async (courseId) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/courses/${courseId}/enroll`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setEnrolledIds([...enrolledIds, courseId]);
        setMessage('Successfully enrolled! 🎉');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header>
        <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>Course Marketplace</h1>
        <p style={{ color: 'var(--text-muted)' }}>Expand your knowledge with our cloud-hosted curriculum.</p>
      </header>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
          <input className="input-field" placeholder="Search courses..." style={{ paddingLeft: '2.75rem' }} />
        </div>
        <button className="btn btn-glass"><Filter size={18} /> Filters</button>
      </div>

      {message && (
        <div style={{ 
          background: 'rgba(16, 185, 129, 0.1)', 
          color: '#10b981', 
          padding: '1rem', 
          borderRadius: 'var(--radius-md)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <CheckCircle size={20} /> {message}
        </div>
      )}

      {/* Course Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {courses.map(course => (
          <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem', flex: 1 }}>
              <div style={{ 
                width: '40px', height: '40px', background: 'rgba(79, 70, 229, 0.1)', 
                borderRadius: '10px', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', marginBottom: '1.25rem', color: 'var(--primary)'
              }}>
                <BookOpen size={20} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>{course.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>{course.description}</p>
            </div>
            
            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-glass)', background: 'rgba(255,255,255,0.02)' }}>
              {enrolledIds.includes(course.id) ? (
                <button className="btn btn-glass" style={{ width: '100%', cursor: 'default', color: '#10b981' }} disabled>
                  <CheckCircle size={18} /> Enrolled
                </button>
              ) : (
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleEnroll(course.id)}>
                  Enroll Now <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;
