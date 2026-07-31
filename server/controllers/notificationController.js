import Notification from '../models/Notification.js';

/**
 * Get all mock email notifications for the logged-in user
 * GET /api/notifications
 */
export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ message: 'Server error retrieving notifications' });
  }
};
