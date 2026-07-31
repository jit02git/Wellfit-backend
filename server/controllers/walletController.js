import User from '../models/User.js';

/**
 * Top up member wallet (Mock Endpoint)
 * POST /api/wallet/topup
 * Restricted to: member
 */
export const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;

    // Convert amount to numeric and perform basic validation
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) {
      return res.status(400).json({ message: 'Please provide a valid top-up amount greater than zero' });
    }

    // Find the member user in database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Double check role authorization (should be handled by restrictTo, but added for safety)
    if (user.role !== 'member') {
      return res.status(403).json({ message: 'Only members can top up their wallet balance' });
    }

    // Increment wallet balance
    user.walletBalance = (user.walletBalance || 0) + topUpAmount;
    await user.save();

    res.json({
      message: 'Wallet topped up successfully',
      walletBalance: user.walletBalance,
    });
  } catch (error) {
    console.error('Wallet topup error:', error.message);
    res.status(500).json({ message: 'Server error during wallet topup' });
  }
};
