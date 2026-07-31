import Slot from '../models/Slot.js';

/**
 * Create a new availability slot
 * POST /api/slots
 * Restricted to: trainer
 */
export const createSlot = async (req, res) => {
  try {
    const { startTime, endTime } = req.body;

    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide start and end times for the slot' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate that dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid date formats provided' });
    }

    // Ensure start time is in the future
    if (start <= new Date()) {
      return res.status(400).json({ message: 'Slot start time must be in the future' });
    }

    // Ensure end time is after start time
    if (end <= start) {
      return res.status(400).json({ message: 'Slot end time must be after the start time' });
    }

    // Check if there is an overlapping slot already created by this trainer
    const overlappingSlot = await Slot.findOne({
      trainerId: req.user._id,
      $or: [
        { startTime: { $lt: end, $gt: start } },
        { endTime: { $gt: start, $lt: end } },
        { startTime: { $lte: start }, endTime: { $gte: end } },
      ],
    });

    if (overlappingSlot) {
      return res.status(400).json({ message: 'You already have an overlapping slot created during this window' });
    }

    // Create the slot
    const slot = await Slot.create({
      trainerId: req.user._id,
      startTime: start,
      endTime: end,
      isBooked: false,
    });

    res.status(201).json(slot);
  } catch (error) {
    console.error('Create slot error:', error.message);
    res.status(500).json({ message: 'Server error during slot creation' });
  }
};

/**
 * Get all available unbooked future slots
 * GET /api/slots/available
 * Access: members and trainers (both can see available slots)
 */
export const getAvailableSlots = async (req, res) => {
  try {
    // Find slots in the future that are not yet booked
    const slots = await Slot.find({
      isBooked: false,
      startTime: { $gt: new Date() },
    })
      .populate('trainerId', 'name email')
      .sort({ startTime: 1 });

    res.json(slots);
  } catch (error) {
    console.error('Get available slots error:', error.message);
    res.status(500).json({ message: 'Server error retrieving slots' });
  }
};

/**
 * Get all slots created by the logged-in trainer
 * GET /api/slots/trainer
 * Restricted to: trainer
 */
export const getTrainerSlots = async (req, res) => {
  try {
    const slots = await Slot.find({ trainerId: req.user._id }).sort({ startTime: 1 });
    res.json(slots);
  } catch (error) {
    console.error('Get trainer slots error:', error.message);
    res.status(500).json({ message: 'Server error retrieving trainer slots' });
  }
};
