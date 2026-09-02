import { ApiResponse } from '../utils/apiResponse.js';
import { ZodError } from 'zod';

export function errorHandler(err, req, res, next) {
  console.error(`[ErrorHandler] ${err.name || 'Error'}: ${err.message}`, err.stack);

  if (err instanceof ZodError) {
    return ApiResponse.error(
      res,
      'Validation failed for input data',
      'VALIDATION_ERROR',
      400,
      err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
    );
  }

  if (err.name === 'CastError') {
    return ApiResponse.error(
      res,
      `Invalid resource ID format for '${err.path}'`,
      'INVALID_ID',
      400
    );
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return ApiResponse.error(res, 'Database validation error', 'VALIDATION_ERROR', 400, details);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return ApiResponse.error(
      res,
      `A resource with this ${field} already exists.`,
      'DUPLICATE_RESOURCE',
      409
    );
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Invalid or expired token', 'INVALID_TOKEN', 401);
  }

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred.';

  return ApiResponse.error(res, message, code, status);
}
