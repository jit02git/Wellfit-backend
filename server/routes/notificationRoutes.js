import express from 'express';
import { getMyNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Retrieve user's mock email notifications
router.get('/', protect, getMyNotifications);

export default router;
