import { register as authRegister, login as authLogin, refresh as authRefresh } from '../services/auth/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

export async function register(req, res, next) {
  try {
    const { email, password, timezone } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password are required', 'MISSING_FIELDS', 400);
    }

    if (password.length < 6) {
      return ApiResponse.error(res, 'Password must be at least 6 characters long', 'WEAK_PASSWORD', 400);
    }

    const result = await authRegister(email, password, timezone);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    return ApiResponse.success(res, {
      user: result.user,
      accessToken: result.accessToken
    }, 201);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Email and password are required', 'MISSING_FIELDS', 400);
    }

    const result = await authLogin(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return ApiResponse.success(res, {
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      return ApiResponse.error(res, 'No refresh token provided', 'MISSING_REFRESH_TOKEN', 401);
    }

    const result = await authRefresh(refreshToken);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return ApiResponse.success(res, {
      user: result.user,
      accessToken: result.accessToken
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req, res) {
  res.clearCookie('refreshToken');
  return ApiResponse.success(res, { message: 'Logged out successfully' });
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return ApiResponse.error(res, 'User not found', 'USER_NOT_FOUND', 404);
    }
    return ApiResponse.success(res, { user });
  } catch (err) {
    next(err);
  }
}
