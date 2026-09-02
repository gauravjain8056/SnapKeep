import { RetentionService } from '../services/retention/retentionService.js';

export async function attachDailyWarning(req, res, next) {
  if (!req.user || !req.user.id) {
    return next();
  }

  try {
    const warning = await RetentionService.checkDailyDeletionWarning(req.user);
    if (warning) {
      res.locals.dailyWarning = warning;
    }
  } catch (err) {
    console.warn('Failed to check daily deletion warning:', err.message);
  }

  next();
}
