const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Quick Serve Backend Running ✅', time: new Date().toISOString() });
});
// Test endpoint
app.get('/test', (req, res) => {
  res.json({ success: true, message: 'Backend is alive' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Quick Serve Server is running on http://localhost:${PORT}`);
  console.log(`📋 Kitchen Dashboard API: http://localhost:${PORT}/api/kitchen/orders`);
  console.log(`🍛 Restaurants API: http://localhost:${PORT}/api/restaurants\n`);
});
