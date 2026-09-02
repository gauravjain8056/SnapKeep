import { verifyAccessToken } from '../services/auth/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return ApiResponse.error(
        res,
        'Authentication required. Please provide a valid Bearer token.',
        'UNAUTHORIZED',
        401
      );
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded || !decoded.userId) {
      return ApiResponse.error(
        res,
        'Token is invalid or expired. Please refresh or log in again.',
        'INVALID_TOKEN',
        401
      );
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
      timezone: decoded.timezone || 'Asia/Kolkata'
    };

    next();
  } catch (error) {
    return ApiResponse.error(res, 'Authentication failed', 'AUTH_ERROR', 401);
  }
}
