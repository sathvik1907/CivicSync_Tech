import mongoose from 'mongoose';

const projectUpdateSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    narrative: {
      type: String,
      required: true
    },
    progressSnapshot: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    expenditureSnapshotPaise: {
      type: Number,
      default: null
    },
    mediaUrls: {
      type: [String],
      default: []
    },
    sourceProvenance: {
      type: String,
      default: 'Official Department Update'
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

export const ProjectUpdate = mongoose.model('ProjectUpdate', projectUpdateSchema);
