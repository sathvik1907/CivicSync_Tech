import mongoose from 'mongoose';

const contractorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    registrationNumber: {
      type: String,
      default: ''
    },
    contactEmail: {
      type: String,
      default: ''
    },
    contactPhone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

export const Contractor = mongoose.model('Contractor', contractorSchema);
