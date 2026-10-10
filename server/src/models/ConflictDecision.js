import mongoose from 'mongoose';

const conflictDecisionSchema = new mongoose.Schema(
  {
    pairKey: {
      type: String, // e.g. "projectIdA::projectIdB" in canonical order
      required: true,
      index: true
    },
    projectA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    projectB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    ruleId: {
      type: String,
      required: true
    },
    ruleVersion: {
      type: String,
      default: '1.0'
    },
    inputFingerprint: {
      type: String, // Hash/fingerprint of relevant dates and segments
      required: true
    },
    decision: {
      type: String,
      enum: ['Coordinated', 'Rescheduled', 'Dismissed', 'Open'],
      required: true
    },
    explanation: {
      type: String,
      required: true
    },
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    decidedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const ConflictDecision = mongoose.model('ConflictDecision', conflictDecisionSchema);
