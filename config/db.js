const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables from .env file

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    // Use the MONGO_URI from the .env file
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit process with failure
  }
};

module.exports = connectDB;
