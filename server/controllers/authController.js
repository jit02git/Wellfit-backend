import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Utility function to generate a JWT token signed with the user ID.
 */
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'wellfit_super_secret_jwt_key_123456',
    { expiresIn: '30d' } // Token is valid for 30 days
  );
};

/**
 * Register a new user (Member or Trainer)
 * POST /api/auth/register
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Simple validation of required parameters
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Role check to prevent input of invalid roles
    if (role !== 'member' && role !== 'trainer') {
      return res.status(400).json({ message: 'Role must be either member or trainer' });
    }

    // Check if user already exists in the system
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create the user in the database (pre-save hook hashes the password)
    const user = await User.create({
      name,
      email,
      password,
      role,
      walletBalance: role === 'member' ? 0 : undefined, // Initialize wallet balance at ₹0 for members only
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      walletBalance: user.walletBalance,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Login an existing user
 * POST /api/auth/login
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Validate password and generate token
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Fetch current user profile
 * GET /api/auth/me
 */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};
