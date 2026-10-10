import mongoose from 'mongoose';

const activityEventSchema = new mongoose.Schema(
  {
    entityType: {
      type: String,
      required: true,
      index: true
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    event: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

export const ActivityEvent = mongoose.model('ActivityEvent', activityEventSchema);
