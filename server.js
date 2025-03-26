const express = require('express');
const cors = require('cors');
const csv = require('csv-parser');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: ['https://my-web-app-dun-iota.vercel.app', 'http://localhost:3002'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));

// Configure multer for file upload
const storage = multer.memoryStorage(); // Use memory storage instead of disk
const upload = multer({ storage: storage });

app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const results = [];
    const fileContent = req.file.buffer.toString();
    
    // Process the CSV data from memory
    require('csv-parse/lib/sync')(fileContent, {
      columns: true,
      skip_empty_lines: true
    }).forEach(row => {
      results.push(row);
    });

    // Process the results
    const processedData = processCSVData(results);
    
    res.json({ message: 'File processed successfully', data: processedData });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ error: 'Error processing file' });
  }
});

// Helper function to process CSV data
function processCSVData(data) {
  const members = data.map(row => {
    // Convert date strings to Date objects
    const joinDate = new Date(row['Join Date'] || null);
    const lastVisit = new Date(row['Last Visit'] || null);

    return {
      name: row['Name'] || 'Unknown',
      role: row['Role'] || 'Member',
      joinDate: isNaN(joinDate.getTime()) ? null : joinDate.toISOString().split('T')[0],
      lastVisit: isNaN(lastVisit.getTime()) ? null : lastVisit.toISOString().split('T')[0],
      visits: parseInt(row['Visits']) || 0,
      posts: parseInt(row['Posts']) || 0,
      comments: parseInt(row['Comments']) || 0,
      reactions: parseInt(row['Reactions']) || 0
    };
  });

  // Calculate metrics
  const totalMembers = members.length;
  const activeMembers = members.filter(m => {
    const lastVisit = m.lastVisit ? new Date(m.lastVisit) : null;
    return lastVisit && (new Date() - lastVisit) < 30 * 24 * 60 * 60 * 1000;
  }).length;

  const totalEngagement = members.reduce((sum, m) => 
    sum + m.visits + m.posts + m.comments + m.reactions, 0);

  // Calculate health scores and categories
  members.forEach(member => {
    const score = calculateHealthScore(member);
    member.healthScore = score;
    member.category = getHealthCategory(score);
  });

  // Get category distribution
  const categoryDistribution = {
    Advocate: members.filter(m => m.category === 'Advocate').length,
    'All Star': members.filter(m => m.category === 'All Star').length,
    Average: members.filter(m => m.category === 'Average').length,
    'At Risk': members.filter(m => m.category === 'At Risk').length
  };

  return {
    members,
    keyMetrics: {
      totalMembers,
      activeMembers,
      totalEngagement,
      engagementRate: (activeMembers / totalMembers * 100).toFixed(1)
    },
    categoryDistribution
  };
}

function calculateHealthScore(member) {
  const now = new Date();
  const lastVisit = member.lastVisit ? new Date(member.lastVisit) : null;
  const daysSinceLastVisit = lastVisit 
    ? Math.floor((now - lastVisit) / (1000 * 60 * 60 * 24))
    : 365;

  const visitScore = Math.max(0, 100 - (daysSinceLastVisit * 2));
  const engagementScore = Math.min(100, (
    (member.visits * 2) +
    (member.posts * 10) +
    (member.comments * 5) +
    (member.reactions * 3)
  ) / 10);

  return Math.round((visitScore + engagementScore) / 2);
}

function getHealthCategory(score) {
  if (score >= 80) return 'Advocate';
  if (score >= 60) return 'All Star';
  if (score >= 40) return 'Average';
  return 'At Risk';
}

// Dashboard data endpoint
app.get('/api/dashboard-data', (req, res) => {
  res.json({
    members: [],
    keyMetrics: {
      totalMembers: 0,
      activeMembers: 0,
      totalEngagement: 0,
      engagementRate: '0.0'
    },
    categoryDistribution: {
      Advocate: 0,
      'All Star': 0,
      Average: 0,
      'At Risk': 0
    }
  });
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
app.get('/api/test', (req, res) => {
  console.log('Test endpoint called');
  res.json({ message: 'Backend is working!' });
});

app.get('/api/dashboard-data', async (req, res) => {
  console.log('Dashboard data endpoint called');

  try {
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

    const dataDir = path.join(__dirname, 'data');
    const csvPath = path.join(dataDir, 'latest.csv');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }

    if (!fs.existsSync(csvPath)) {
      console.log('CSV file not found');
      return res.status(404).json({ error: 'No data available. Please upload a CSV file.' });
    }

    console.log('CSV file found, starting to read...');
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
