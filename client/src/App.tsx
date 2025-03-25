import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline, Box, Container, Alert, CircularProgress } from '@mui/material';
import { DashboardData } from './types';
import KeyMetricsPanel from './components/KeyMetricsPanel';
import CategoryDistribution from './components/CategoryDistribution';
import TopEngagementChart from './components/TopEngagementChart';
import MemberHealthTable from './components/MemberHealthTable';
import FileUpload from './components/FileUpload';
import axios from 'axios';
import { API_URL } from './config';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8A2BE2', // Advocate Purple
    },
    secondary: {
      main: '#4CAF50', // All Star Green
    },
    warning: {
      main: '#FFC107', // Average Yellow
    },
    error: {
      main: '#F44336', // At-Risk Red
    },
  },
});

// Configure axios
axios.defaults.baseURL = API_URL;

function App() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data...');
      const response = await axios.get<DashboardData>('/api/dashboard-data');
      console.log('Received dashboard data:', response.data);
      if (!response.data || !response.data.members) {
        throw new Error('Invalid data received from server');
      }
      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: errorMessage
        });
        setError(errorMessage);
      } else {
        setError('An unexpected error occurred');
      }
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <FileUpload onUploadSuccess={fetchData} />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (!dashboardData || !dashboardData.members) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Container maxWidth="lg">
          <Box sx={{ mt: 4 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              No dashboard data available
            </Alert>
            <FileUpload onUploadSuccess={fetchData} />
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <FileUpload onUploadSuccess={fetchData} />
          <KeyMetricsPanel metrics={dashboardData.keyMetrics} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, my: 4 }}>
            <CategoryDistribution data={dashboardData.categoryDistribution} />
            <TopEngagementChart members={dashboardData.members} />
          </Box>
          <MemberHealthTable members={dashboardData.members} />
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
