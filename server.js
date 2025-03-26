const express = require('express');
const cors = require('cors');
const multer = require('multer');

const app = express();

// CORS configuration
app.use(cors({
  origin: [
    'https://my-web-app-dun-iota.vercel.app',
    'https://my-web-app-dun-iota.vercel.app/',
    'http://localhost:3002',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true
}));

// Basic memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('File received:', req.file.originalname);
    res.json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
