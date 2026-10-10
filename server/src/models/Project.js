import mongoose from 'mongoose';
import './Department.js';
import './Contractor.js';

const milestoneSchema = new mongoose.Schema(
  {
    milestoneId: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    weight: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    dueDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    progress: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0
    },
    actualCompletionDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    order: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    projectCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    purpose: {
      type: String,
      required: true
    },
    workType: {
      type: String,
      required: true,
      index: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    locality: {
      type: String,
      required: true,
      index: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
      index: true
    },
    contractor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contractor',
      default: null
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      }
    },
    roadSegmentIds: {
      type: [String],
      default: [],
      index: true
    },
    publicationState: {
      type: String,
      enum: ['Draft', 'Published', 'Withdrawn'],
      default: 'Published',
      index: true
    },
    executionState: {
      type: String,
      enum: ['Planned', 'Ongoing', 'Completed'],
      default: 'Ongoing',
      index: true
    },
    plannedStartDate: {
      type: String, // YYYY-MM-DD
      required: true
    },
    originalDeadline: {
      type: String, // YYYY-MM-DD
      required: true
    },
    revisedForecastDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    actualStartDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    actualCompletionDate: {
      type: String, // YYYY-MM-DD
      default: null
    },
    delayExplanation: {
      type: String,
      default: ''
    },
    withdrawalExplanation: {
      type: String,
      default: ''
    },
    estimatedBudgetPaise: {
      type: Number,
      default: null
    },
    actualExpenditurePaise: {
      type: Number,
      default: null
    },
    milestones: {
      type: [milestoneSchema],
      default: []
    },
    featuredImage: {
      type: String,
      default: ''
    },
    beforeAfterPair: {
      beforeImage: { type: String, default: null },
      afterImage: { type: String, default: null },
      viewpoint: { type: String, default: '' },
      beforeDate: { type: String, default: '' },
      afterDate: { type: String, default: '' },
      label: { type: String, default: 'Synthetic Demonstration Comparison' }
    },
    sourceLabel: {
      type: String,
      default: 'Synthetic Demonstration Data (TransparanceCity)'
    },
    demoOrigin: {
      type: Boolean,
      default: true
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now
    },
    version: {
      type: Number,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for location
projectSchema.index({ location: '2dsphere' });
// Compound search index
projectSchema.index({ publicationState: 1, city: 1, department: 1, executionState: 1 });

export const Project = mongoose.model('Project', projectSchema);
