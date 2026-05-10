import React from 'react';

const StatCard = ({ title, value, icon: Icon, color }) => {
  return (
    <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
      <div style={{ 
        width: '48px', 
        height: '48px', 
        background: `${color}15`, 
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: color
      }}>
        <Icon size={24} />
      </div>
      <div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{title}</p>
        <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
