const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 })
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const { username, email, password } = req.body;

    console.log('Registration attempt:', { username, email });

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ] 
    });
    
    if (user) {
      const field = user.email === email.toLowerCase() ? 'Email' : 'Username';
      return res.status(400).json({ 
        success: false,
        message: `${field} already exists`
      });
    }

    // Create new user
    user = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password
    });

    await user.save();
    console.log('User saved:', user._id);

    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  check('username', 'Username or email is required').not().isEmpty(),
  check('password', 'Password is required').exists()
], async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    }

    const { username, password } = req.body;
    console.log('Login attempt for:', username);

    // Find user by username or email (case insensitive)
    const user = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: username.toLowerCase() }
      ]
    });

    if (!user) {
      console.log('User not found:', username);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found, comparing password...');

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log('Password mismatch for user:', user.username);
      return res.status(400).json({ 
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Password matched, generating token...');

    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/auth/verify
// @desc    Verify token
// @access  Private
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.json({ valid: false, message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.json({ valid: false, message: 'No token provided' });
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(verified.id).select('-password');
    if (!user) {
      return res.json({ valid: false, message: 'User not found' });
    }

    res.json({ 
      valid: true, 
      user 
    });
    
  } catch (error) {
    console.error('Token verification error:', error.message);
    res.json({ 
      valid: false, 
      message: 'Invalid token' 
    });
  }
});

module.exports = router;