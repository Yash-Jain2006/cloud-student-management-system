import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f43f5e', '#0ea5e9', '#f59e0b'];

export const PopularityChart = ({ data }) => (
  <div className="glass-card" style={{ padding: '1.5rem', height: '400px' }}>
    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>Course Popularity</h3>
    <div style={{ height: '320px', minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="name" 
            stroke="var(--text-dim)" 
            fontSize={12}
            tick={{ fill: 'var(--text-dim)' }}
          />
          <YAxis 
            stroke="var(--text-dim)" 
            fontSize={12}
            tick={{ fill: 'var(--text-dim)' }}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid var(--border-glass)',
              borderRadius: '8px',
              color: '#fff'
            }}
          />
          <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const UserPieChart = ({ data }) => (
  <div className="glass-card" style={{ padding: '1.5rem', height: '400px' }}>
    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>User Distribution</h3>
    <div style={{ height: '320px', minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="role"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              background: 'rgba(15, 23, 42, 0.9)', 
              border: '1px solid var(--border-glass)',
              borderRadius: '8px'
            }}
          />
          <Legend verticalAlign="bottom" height={36}/>
        </PieChart>
      </ResponsiveContainer>
    </div>
  </div>
);
