import express from 'express';
import { createSlot, getAvailableSlots, getTrainerSlots } from '../controllers/slotController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Create new slot - restricted to trainers
router.post('/', protect, restrictTo('trainer'), createSlot);

// View list of all available slots
router.get('/available', protect, getAvailableSlots);

// View list of slots created by the current trainer - restricted to trainers
router.get('/trainer', protect, restrictTo('trainer'), getTrainerSlots);

export default router;
