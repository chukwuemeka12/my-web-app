import { Paper, Grid, Typography, Box, CircularProgress, Alert } from '@mui/material';
import { PeopleAlt, TrendingUp, TrendingDown, Warning } from '@mui/icons-material';

interface Props {
  metrics?: {
    totalMembers: number;
    newMembers: number;
    atRiskMembers: number;
    churnRate: number;
  };
  loading?: boolean;
  error?: string | null;
}

const MetricCard = ({ name, value, icon }: { name: string; value: number; icon: React.ReactNode }) => (
  <Paper elevation={2} sx={{ p: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
      {icon}
      <Typography variant="h6" sx={{ ml: 1 }}>
        {name}
      </Typography>
    </Box>
    <Typography variant="h4">{value}</Typography>
  </Paper>
);

const KeyMetricsPanel = ({ metrics, loading = false, error = null }: Props) => {
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        No metrics data available
      </Alert>
    );
  }

  const metricsList = [
    { name: 'Total Members', value: metrics.totalMembers },
    { name: 'New Members', value: metrics.newMembers },
    { name: 'At Risk', value: metrics.atRiskMembers },
    { name: 'Churn Rate', value: metrics.churnRate }
  ];

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'total members':
        return <PeopleAlt color="primary" />;
      case 'new members':
        return <TrendingUp color="success" />;
      case 'churn rate':
        return <TrendingDown color="error" />;
      case 'at risk':
        return <Warning color="warning" />;
      default:
        return <TrendingUp />;
    }
  };

  return (
    <Grid container spacing={3}>
      {metricsList.map((metric) => (
        <Grid item xs={12} sm={6} md={3} key={metric.name}>
          <MetricCard
            name={metric.name}
            value={metric.value}
            icon={getIcon(metric.name)}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default KeyMetricsPanel;
