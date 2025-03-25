const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Load environment variables
dotenv.config();

const app = express();
const dataDir = path.join(__dirname, 'data');
const csvPath = path.join(dataDir, 'latest.csv');

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, dataDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'latest.csv');
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Middleware
app.use(express.json());

// Add CORS configuration
app.use(cors({
  origin: '*', // In production, replace with your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Calculate member scores
function calculateMemberScores(metrics, lastVisit) {
  const now = new Date();
  const lastVisitDate = new Date(lastVisit);
  const daysSinceLastVisit = Math.floor((now - lastVisitDate) / (1000 * 60 * 60 * 24));

  return {
    recency: Math.max(0, 100 - (daysSinceLastVisit * 2)),
    engagement: Math.min(100, (
      (metrics.postClicks * 0.2) +
      (metrics.totalContributions * 0.5) +
      (metrics.visits * 0.3)
    )),
    consumption: Math.min(100, (
      (metrics.publishedPosts * 1.0) +
      (metrics.comments * 0.4) +
      (metrics.cheers * 0.2)
    )),
    participation: Math.min(100, (
      (metrics.votes * 0.2) +
      (metrics.rsvps * 0.5) +
      (metrics.shares * 0.8) +
      (metrics.messagesSent * 0.3)
    )),
    streak: Math.min(100, metrics.currentStreak * 10)
  };
}

// Calculate CHI scores and categories
function calculateScores(metrics) {
  // Normalize engagement metrics to better reflect activity levels
  const engagementScore = Math.min(100, (
    (metrics.postClicks * 0.2) +
    (metrics.totalContributions * 0.5) +
    (metrics.visits * 0.3) +
    (metrics.publishedPosts * 1.0) +
    (metrics.comments * 0.4) +
    (metrics.cheers * 0.2) +
    (metrics.votes * 0.2) +
    (metrics.rsvps * 0.5) +
    (metrics.shares * 0.8) +
    (metrics.messagesSent * 0.3)
  ));

  const learningScore = Math.min(100, (
    (metrics.coursesStarted * 10) +
    (metrics.coursesCompleted * 20) +
    (metrics.lessonsStarted * 2) +
    (metrics.lessonsCompleted * 5)
  ));

  const chiScore = Math.round((engagementScore * 0.7 + learningScore * 0.3));

  let category;
  let categoryColor;

  if (chiScore >= 80) {
    category = 'Advocate';
    categoryColor = '#8A2BE2';
  } else if (chiScore >= 60) {
    category = 'All Star';
    categoryColor = '#4CAF50';
  } else if (chiScore >= 40) {
    category = 'Average';
    categoryColor = '#FFC107';
  } else {
    category = 'At Risk';
    categoryColor = '#F44336';
  }

  return { chiScore, category, categoryColor };
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    // Parse YYYY-MM-DD format
    const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      throw new Error('Invalid date components');
    }
    const date = new Date(year, month - 1, day); // month is 0-based in JS
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return null;
  }
}

// Routes
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    console.log('File uploaded successfully:', req.file.originalname);
    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file', details: error.message });
  }
});

app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Backend is working!' });
});

app.get('/api/dashboard-data', async (req, res) => {
  console.log('Dashboard data endpoint called');
  console.log('Looking for CSV file at:', csvPath);

  if (!fs.existsSync(csvPath)) {
    console.log('CSV file not found');
    return res.status(404).json({ error: 'No data available. Please upload a CSV file.' });
  }

  console.log('CSV file found, starting to read...');
  const results = [];
  const keyMetrics = {
    totalMembers: 0,
    newMembers: 0,
    atRiskMembers: 0,
    churnRate: 0
  };

  const categoryDistribution = {
    Advocate: 0,
    'All Star': 0,
    Average: 0,
    'At Risk': 0
  };

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  try {
    await new Promise((resolve, reject) => {
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Skip header row with --
          if (row[Object.keys(row)[0]] === '--') {
            return;
          }

          const keys = Object.keys(row);
          const values = Object.values(row);
          const avatarUrl = values[0];
          const name = values[1];
          const role = values[2];
          const joinDate = values[3];
          const lastVisit = values[4];
          const currentStreak = values[5];
          const maxStreak = values[6];

          if (!name) return; // Skip if no name

          // Convert string values to numbers and handle commas
          const metrics = {
            postClicks: parseInt(values[7]?.replace(/,/g, '')) || 0,
            totalContributions: parseInt(values[8]?.replace(/,/g, '')) || 0,
            visits: parseInt(values[9]?.replace(/,/g, '')) || 0,
            publishedPosts: parseInt(values[10]?.replace(/,/g, '')) || 0,
            comments: parseInt(values[11]?.replace(/,/g, '')) || 0,
            cheers: parseInt(values[12]?.replace(/,/g, '')) || 0,
            votes: parseInt(values[13]?.replace(/,/g, '')) || 0,
            rsvps: parseInt(values[14]?.replace(/,/g, '')) || 0,
            shares: parseInt(values[15]?.replace(/,/g, '')) || 0,
            messagesSent: parseInt(values[16]?.replace(/,/g, '')) || 0,
            coursesStarted: parseInt(values[17]?.replace(/,/g, '')) || 0,
            coursesCompleted: parseInt(values[18]?.replace(/,/g, '')) || 0,
            lessonsStarted: parseInt(values[19]?.replace(/,/g, '')) || 0,
            lessonsCompleted: parseInt(values[20]?.replace(/,/g, '')) || 0,
            currentStreak: parseInt(currentStreak?.replace(/,/g, '')) || 0,
            maxStreak: parseInt(maxStreak?.replace(/,/g, '')) || 0
          };

          const { chiScore, category, categoryColor } = calculateScores(metrics);
          
          const joinDateStr = parseDate(joinDate);
          const lastVisitStr = parseDate(lastVisit);
          
          if (!joinDateStr || !lastVisitStr) {
            console.error('Invalid date for member:', name);
            return;
          }

          const joinDateObj = new Date(joinDateStr);
          const lastVisitObj = new Date(lastVisitStr);
          const scores = calculateMemberScores(metrics, lastVisitStr);

          const member = {
            name,
            role: role || 'Member',
            joinDate: joinDateStr,
            lastVisit: lastVisitStr,
            currentStreak: metrics.currentStreak,
            maxStreak: metrics.maxStreak,
            chiScore,
            category,
            categoryColor,
            scores,
            metrics
          };

          results.push(member);

          // Update key metrics
          keyMetrics.totalMembers++;
          if (joinDateObj > thirtyDaysAgo) {
            keyMetrics.newMembers++;
          }
          if (category === 'At Risk') {
            keyMetrics.atRiskMembers++;
          }
          if (lastVisitObj < thirtyDaysAgo) {
            keyMetrics.churnRate++;
          }

          // Update category distribution
          categoryDistribution[category]++;
        })
        .on('end', () => {
          console.log('Finished reading CSV');
          resolve();
        })
        .on('error', (error) => {
          console.error('Error reading CSV:', error);
          reject(error);
        });
    });

    // Calculate churn rate as a percentage
    keyMetrics.churnRate = Math.round((keyMetrics.churnRate / keyMetrics.totalMembers) * 100);

    // Sort members by CHI score for the dashboard
    results.sort((a, b) => b.chiScore - a.chiScore);

    console.log('Sending response with data');
    res.json({
      members: results,
      keyMetrics,
      categoryDistribution
    });
  } catch (error) {
    console.error('Error processing data:', error);
    res.status(500).json({ error: 'Failed to process data', details: error.message });
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
