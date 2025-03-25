import { Paper, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Member } from '../types';

interface Props {
  members: Member[];
}

const TopEngagementChart = ({ members }: Props) => {
  const topMembers = members
    .sort((a, b) => b.chiScore - a.chiScore)
    .slice(0, 5)
    .map((member) => ({
      name: member.name,
      score: member.chiScore,
      color: member.categoryColor,
    }));

  return (
    <Paper elevation={2} sx={{ p: 2, height: '400px' }}>
      <Typography variant="h6" gutterBottom>
        Top Engagement Scores
      </Typography>
      <ResponsiveContainer width="100%" height="90%">
        <BarChart data={topMembers}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Bar
            dataKey="score"
            name="CHI Score"
            fill="#8A2BE2"
          >
            {topMembers.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default TopEngagementChart;
