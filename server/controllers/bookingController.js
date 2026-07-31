import Booking from '../models/Booking.js';
import Slot from '../models/Slot.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

/**
 * Helper to dispatch a mock email and save it in the database Notification table.
 */
const sendMockEmail = async ({ userId, email, memberName, trainerName, startTime, endTime }) => {
  const formattedStart = new Date(startTime).toLocaleString();
  const formattedEnd = new Date(endTime).toLocaleString();

  const subject = '🎉 Session Booking Confirmation - Wellfit';
  const body = `Dear ${memberName},

Your session booking has been successfully confirmed!

Session Details:
- Trainer: ${trainerName}
- Date/Time: ${formattedStart} to ${formattedEnd}
- Amount Deducted: ₹200.00

Thank you for choosing Wellfit for your wellness journey!

Best regards,
The Wellfit Team`;

  // 1. Log mock email directly to server console
  console.log('\n==================================================');
  console.log(`✉️  [MOCK EMAIL DISPATCHED]`);
  console.log(`To: ${email}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${body}`);
  console.log('==================================================\n');

  // 2. Save in notification database so the member can read it in the UI Mock Inbox
  await Notification.create({
    userId,
    recipientEmail: email,
    subject,
    body,
  });
};

/**
 * Book an available session slot
 * POST /api/bookings
 * Restricted to: member
 */
export const bookSession = async (req, res) => {
  const { slotId } = req.body;

  if (!slotId) {
    return res.status(400).json({ message: 'Please provide a slot ID to book' });
  }

  try {
    // 1. Find the target slot
    const slot = await Slot.findById(slotId).populate('trainerId', 'name email');
    if (!slot) {
      return res.status(404).json({ message: 'Slot not found' });
    }

    // 2. Check if the slot is in the future
    if (new Date(slot.startTime) <= new Date()) {
      return res.status(400).json({ message: 'Cannot book a slot that has already started or passed' });
    }

    // 3. Verify member has sufficient wallet balance before attempting atomic edits
    const member = await User.findById(req.user._id);
    if (!member) {
      return res.status(404).json({ message: 'Member profile not found' });
    }

    if (member.walletBalance < 200) {
      return res.status(400).json({ message: 'Insufficient wallet balance. You need at least ₹200 to book a session.' });
    }

    // 4. Atomically mark slot as booked to prevent race conditions (double bookings)
    const updatedSlot = await Slot.findOneAndUpdate(
      { _id: slotId, isBooked: false },
      { isBooked: true },
      { new: true }
    );

    if (!updatedSlot) {
      return res.status(400).json({ message: 'This slot has already been booked by another member.' });
    }

    // 5. Deduct ₹200 from member's wallet balance atomically
    const updatedMember = await User.findOneAndUpdate(
      { _id: req.user._id, walletBalance: { $gte: 200 } },
      { $inc: { walletBalance: -200 } },
      { new: true }
    );

    // Rollback slot booking if wallet deduction fails unexpectedly
    if (!updatedMember) {
      await Slot.findByIdAndUpdate(slotId, { isBooked: false });
      return res.status(400).json({ message: 'Payment failed. Booking cancelled.' });
    }

    // 6. Create booking record
    const booking = await Booking.create({
      slotId,
      memberId: req.user._id,
      amountPaid: 200,
    });

    // 7. Send mock email confirmation async
    await sendMockEmail({
      userId: member._id,
      email: member.email,
      memberName: member.name,
      trainerName: slot.trainerId ? slot.trainerId.name : 'Wellness Trainer',
      startTime: slot.startTime,
      endTime: slot.endTime,
    });

    res.status(201).json({
      message: 'Session booked successfully',
      booking,
      newWalletBalance: updatedMember.walletBalance,
    });
  } catch (error) {
    console.error('Session booking error:', error.message);
    res.status(500).json({ message: 'Server error during slot booking' });
  }
};

/**
 * Get booking history for the logged-in member
 * GET /api/bookings/member
 * Restricted to: member
 */
export const getMemberBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ memberId: req.user._id })
      .populate({
        path: 'slotId',
        populate: {
          path: 'trainerId',
          select: 'name email',
        },
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get member bookings error:', error.message);
    res.status(500).json({ message: 'Server error retrieving booking history' });
  }
};

/**
 * Get all slots booked with the logged-in trainer
 * GET /api/bookings/trainer
 * Restricted to: trainer
 */
export const getTrainerBookings = async (req, res) => {
  try {
    // 1. Fetch slots added by this trainer
    const trainerSlots = await Slot.find({ trainerId: req.user._id });
    const slotIds = trainerSlots.map((slot) => slot._id);

    // 2. Fetch bookings associated with those slot IDs
    const bookings = await Booking.find({ slotId: { $in: slotIds } })
      .populate('memberId', 'name email')
      .populate('slotId')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Get trainer bookings error:', error.message);
    res.status(500).json({ message: 'Server error retrieving attendee list' });
  }
};
