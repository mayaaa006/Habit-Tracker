// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User"); // Import User model
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB connection error:", err));

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // to parse JSON request bodies
app.use(express.urlencoded({ extended: true })); 
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true,
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Users
const userRoutes = require('./routers/userRouters');
// Routes
app.use('/api/users', userRoutes);

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Simple user routes directly in server.js
app.get('/api/users', (req, res) => {
  res.json({ message: 'This would return all users' });
});

// Register
app.post('/api/users/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email
    };

    res.status(200).json(userData);
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: error.message });
  }
});

// Login in
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    // Return user data (excluding password)
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    ); 

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      token
    };
    
    res.status(200).json(userData);
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: error.message });
  }
});


// Habits
const habitRoutes = require('./routers/habitRouters');
app.use('/api/habits', habitRoutes);


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});