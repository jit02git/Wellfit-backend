import express from 'express';
import { handleChat } from '../controllers/chatController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/chat - Protected endpoint for logged in users
router.post('/', protect, handleChat);

export default router;
