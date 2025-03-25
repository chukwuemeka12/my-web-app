import { Paper, Typography, CircularProgress, Alert } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  data?: {
    Advocate: number;
    'All Star': number;
    Average: number;
    'At Risk': number;
  };
  loading?: boolean;
  error?: string | null;
}

const CategoryDistribution = ({ data, loading = false, error = null }: Props) => {
  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2, height: '400px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 2, height: '400px', display: 'flex', alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Paper>
    );
  }

  if (!data) {
    return (
      <Paper elevation={2} sx={{ p: 2, height: '400px', display: 'flex', alignItems: 'center' }}>
        <Alert severity="info" sx={{ width: '100%' }}>
          No category distribution data available
        </Alert>
      </Paper>
    );
  }

  const chartData = [
    { name: 'Advocate', value: data.Advocate, color: '#8A2BE2' },
    { name: 'All Star', value: data['All Star'], color: '#4CAF50' },
    { name: 'Average', value: data.Average, color: '#FFC107' },
    { name: 'At Risk', value: data['At Risk'], color: '#F44336' }
  ].filter(item => item.value > 0); // Only show categories with members

  if (chartData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2, height: '400px', display: 'flex', alignItems: 'center' }}>
        <Alert severity="info" sx={{ width: '100%' }}>
          No members in any category
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 2, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        Member Health Distribution
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={120}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => [`${value} members`, 'Count']}
          />
        </PieChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default CategoryDistribution;
