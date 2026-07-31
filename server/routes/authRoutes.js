import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public registration route
router.post('/register', register);

// Public login route
router.post('/login', login);

// Protected token validation and profile retrieval route
router.get('/me', protect, getMe);

export default router;
