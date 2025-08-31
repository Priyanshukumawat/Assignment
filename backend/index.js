const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const authenticateToken = require('./middleware/authMiddleware');


require('dotenv').config();

// Enable CORS for frontend
app.use(cors({
  origin: 'http://localhost:3000', // your React app
  credentials: true
}));

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // serve uploaded files

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);


// Test DB and start server
PORT = 3001;


sequelize.sync().then(() => {
  console.log('Database synced!');
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
