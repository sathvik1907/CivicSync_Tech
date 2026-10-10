import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    purpose: {
      type: String,
      enum: ['resident_evidence', 'official_update', 'before_after'],
      required: true
    },
    deliveryType: {
      type: String,
      enum: ['authenticated', 'public'],
      default: 'authenticated'
    },
    cloudinaryPublicId: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      required: true
    },
    format: {
      type: String,
      default: 'jpg'
    },
    sizeBytes: {
      type: Number,
      default: 0
    },
    dimensions: {
      width: Number,
      height: Number
    },
    viewpointId: {
      type: String,
      default: ''
    },
    state: {
      type: String,
      enum: ['ready', 'attached', 'abandoned'],
      default: 'ready'
    }
  },
  {
    timestamps: true
  }
);

export const Media = mongoose.model('Media', mediaSchema);
