const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Import routes
const doctorRoutes = require('./routes/doctors');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const authRoutes = require('./routes/auth');

// Mount routes
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/auth', authRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Healthcare Scheduling System API' });
});

// Error handler middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    error: err.message || 'Server Error' 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} | http://localhost:${PORT}/`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 




// 
// name
// test

// email
// test@gmail.com

// password
// test@123

// --- -- --- -- --- -- 

// name
// test2

// email
// test@gmail.com

// password
// test@123

// role
// admin

// --- -- --- -- --- -- 
