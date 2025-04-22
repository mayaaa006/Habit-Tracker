// middleware/authMiddleware.js 
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Changed from userModel to User

const protect = async (req, res, next) => {
  console.log('Headers received:', req.headers);
  console.log('Authorization header:', req.headers.authorization);
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || '0949a0327b222a8b6281ee033a49b1a392fd5d6ce8a90d02ba02771879c579dcdac08a2a741f8567929a754562c40974b2e15b2658e624866ee223b68519e333');

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

module.exports = { protect };