import mongoose from 'mongoose';

const idempotencyRecordSchema = new mongoose.Schema(
  {
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    operation: {
      type: String,
      required: true
    },
    idempotencyKey: {
      type: String,
      required: true,
      index: true
    },
    requestHash: {
      type: String,
      required: true
    },
    statusCode: {
      type: Number,
      required: true
    },
    responseBody: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // TTL index automatically cleans up expired keys
    }
  },
  {
    timestamps: true
  }
);

idempotencyRecordSchema.index({ actor: 1, operation: 1, idempotencyKey: 1 }, { unique: true });

export const IdempotencyRecord = mongoose.model('IdempotencyRecord', idempotencyRecordSchema);
