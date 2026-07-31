import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Slot',
      required: [true, 'Booking must be associated with a slot'],
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a member'],
    },
    amountPaid: {
      type: Number,
      default: 200, // ₹200 as per requirements
    },
  },
  {
    timestamps: true,
  }
);

// Prevent double bookings or user booking issues with clean indices
bookingSchema.index({ slotId: 1 }, { unique: true });

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
