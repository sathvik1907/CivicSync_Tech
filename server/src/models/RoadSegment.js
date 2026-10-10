import mongoose from 'mongoose';

const roadSegmentSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      required: true,
      trim: true
    },
    corridorCode: {
      type: String,
      required: true,
      trim: true
    },
    segmentCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    startLabel: {
      type: String,
      required: true,
      trim: true
    },
    endLabel: {
      type: String,
      required: true,
      trim: true
    },
    coordinates: {
      type: [[Number]], // Array of [lon, lat] pairs along segment
      default: []
    }
  },
  {
    timestamps: true
  }
);

export const RoadSegment = mongoose.model('RoadSegment', roadSegmentSchema);
