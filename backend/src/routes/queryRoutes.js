import express from 'express';
import { handleQuery } from '../controllers/queryController.js';
import { requireAuth } from '../middleware/auth.js';
import { generalRateLimiter } from '../middleware/rateLimiter.js';
import { attachDailyWarning } from '../middleware/dailyWarning.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', generalRateLimiter, attachDailyWarning, handleQuery);

export default router;
