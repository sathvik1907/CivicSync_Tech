import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

export async function registerResident({ email, password, displayName }) {
  if (!email || !password || !displayName) {
    const error = new Error('Email, password, and display name are required.');
    error.statusCode = 400;
    error.code = 'MISSING_FIELDS';
    throw error;
  }

  const emailNormalized = email.trim().toLowerCase();
  
  if (password.length < 8) {
    const error = new Error('Password must be at least 8 characters long.');
    error.statusCode = 400;
    error.code = 'PASSWORD_TOO_SHORT';
    throw error;
  }

  const existing = await User.findOne({ emailNormalized });
  if (existing) {
    const error = new Error('An account with this email address already exists.');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_REGISTERED';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // SECURITY: Public registration is strictly restricted to 'resident' role
  const user = await User.create({
    emailNormalized,
    passwordHash,
    displayName: displayName.trim(),
    role: 'resident',
    active: true
  });

  return user;
}

export async function login({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required.');
    error.statusCode = 400;
    error.code = 'MISSING_CREDENTIALS';
    throw error;
  }

  const emailNormalized = email.trim().toLowerCase();
  const user = await User.findOne({ emailNormalized }).populate('department');

  if (!user || !user.active) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  return user;
}

export async function getUserById(userId) {
  return await User.findById(userId).populate('department');
}
