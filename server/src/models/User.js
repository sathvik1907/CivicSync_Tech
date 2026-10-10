import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    emailNormalized: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      enum: ['resident', 'officer', 'coordinator'],
      default: 'resident',
      required: true
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null
    },
    isDemoAccount: {
      type: Boolean,
      default: false,
      index: true
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Method to return safe JSON without password hash
userSchema.methods.toSafeJSON = function () {
  const department = this.department;
  return {
    id: this._id.toString(),
    email: this.emailNormalized,
    displayName: this.displayName,
    role: this.role,
    department: department
      ? department._id
        ? { id: department._id.toString(), code: department.code, name: department.name }
        : department.toString()
      : null,
    active: this.active,
    createdAt: this.createdAt
  };
};

export const User = mongoose.model('User', userSchema);
