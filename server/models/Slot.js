import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    trainerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Slot must belong to a trainer'],
    },
    startTime: {
      type: Date,
      required: [true, 'Please provide a start time for the slot'],
    },
    endTime: {
      type: Date,
      required: [true, 'Please provide an end time for the slot'],
    },
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index to quickly query slots by trainer or availability
slotSchema.index({ trainerId: 1, startTime: 1 });

const Slot = mongoose.model('Slot', slotSchema);

export default Slot;
