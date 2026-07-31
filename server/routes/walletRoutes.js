import express from 'express';
import { topUpWallet } from '../controllers/walletController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

// Top up wallet route, restricted to members only
router.post('/topup', protect, restrictTo('member'), topUpWallet);

export default router;
