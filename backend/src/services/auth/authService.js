import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User.js';
import { config } from '../../config/env.js';

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      email: user.email,
      timezone: user.timezone || 'Asia/Kolkata'
    },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiry }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString()
    },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiry }
  );
}

function generateTokenPair(user) {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user)
  };
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, config.jwtAccessSecret);
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, config.jwtRefreshSecret);
  } catch {
    return null;
  }
}

export async function register(email, password, timezone = 'Asia/Kolkata') {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    const error = new Error('User with this email already exists');
    error.code = 'EMAIL_EXISTS';
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    timezone: timezone || 'Asia/Kolkata'
  });

  const tokens = generateTokenPair(user);
  return {
    user: {
      id: user._id,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt
    },
    ...tokens
  };
}

export async function login(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    error.status = 401;
    throw error;
  }

  const isValid = await comparePassword(password, user.passwordHash);
  if (!isValid) {
    const error = new Error('Invalid email or password');
    error.code = 'INVALID_CREDENTIALS';
    error.status = 401;
    throw error;
  }

  const tokens = generateTokenPair(user);
  return {
    user: {
      id: user._id,
      email: user.email,
      timezone: user.timezone,
      createdAt: user.createdAt
    },
    ...tokens
  };
}

export async function refresh(refreshToken) {
  if (!refreshToken) {
    const error = new Error('Refresh token is required');
    error.code = 'MISSING_REFRESH_TOKEN';
    error.status = 401;
    throw error;
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded || !decoded.userId) {
    const error = new Error('Invalid or expired refresh token');
    error.code = 'INVALID_REFRESH_TOKEN';
    error.status = 401;
    throw error;
  }

  const user = await User.findById(decoded.userId);
  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const tokens = generateTokenPair(user);
  return {
    user: {
      id: user._id,
      email: user.email,
      timezone: user.timezone
    },
    ...tokens
  };
}
