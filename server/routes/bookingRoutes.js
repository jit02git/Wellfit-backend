import express from 'express';
import { bookSession, getMemberBookings, getTrainerBookings } from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Book a session slot - restricted to members
router.post('/', protect, restrictTo('member'), bookSession);

// View member booking history - restricted to members
router.get('/member', protect, restrictTo('member'), getMemberBookings);

// View list of members who booked the trainer's slots - restricted to trainers
router.get('/trainer', protect, restrictTo('trainer'), getTrainerBookings);

export default router;
