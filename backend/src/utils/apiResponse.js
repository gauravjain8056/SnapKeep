export class ApiResponse {
  static success(res, data = {}, status = 200, meta = {}) {
    const payload = {
      success: true,
      data
    };

    if (res.locals && res.locals.dailyWarning) {
      payload.dailyWarning = res.locals.dailyWarning;
    }

    if (Object.keys(meta).length > 0) {
      payload.meta = meta;
    }

    return res.status(status).json(payload);
  }

  static error(res, message = 'Internal Server Error', code = 'INTERNAL_ERROR', status = 500, details = null) {
    const payload = {
      success: false,
      error: {
        code,
        message
      }
    };

    if (details) {
      payload.error.details = details;
    }

    return res.status(status).json(payload);
  }
}
