import mongoose from 'mongoose';

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    response: {
      type: String,
      default: ''
    },
    reason: {
      type: String,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const reportSchema = new mongoose.Schema(
  {
    referenceCode: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
      index: true
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Potholes',
        'Damaged roads',
        'Drainage problems',
        'Waterlogging',
        'Water pipeline problems',
        'Broken footpaths',
        'Streetlight failures',
        'Exposed cables',
        'Incomplete work',
        'Other civic issues'
      ],
      index: true
    },
    description: {
      type: String,
      required: true
    },
    // Strictly private location details (never exposed publicly)
    privateLocation: {
      address: { type: String, default: '' },
      city: { type: String, default: '' },
      locality: { type: String, default: '' },
      coordinates: {
        type: [Number], // [lon, lat]
        default: undefined
      }
    },
    // Obfuscated 250m cell for safe public heatmap aggregation
    publicGridCell: {
      cellId: { type: String, index: true },
      centerLat: { type: Number },
      centerLon: { type: Number }
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
      index: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    status: {
      type: String,
      enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Submitted',
      index: true
    },
    officialResponse: {
      type: String,
      default: ''
    },
    rejectionReason: {
      type: String,
      default: ''
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: []
    },
    mediaUrls: {
      type: [String],
      validate: [val => val.length <= 3, '{PATH} exceeds limit of 3 photographs'],
      default: []
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      index: true
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

// Method to project safe public data (for insights/heatmap aggregation)
reportSchema.methods.toPublicSafe = function () {
  return {
    referenceCode: this.referenceCode,
    category: this.category,
    status: this.status,
    publicGridCell: this.publicGridCell,
    createdAt: this.createdAt
  };
};

export const Report = mongoose.model('Report', reportSchema);
