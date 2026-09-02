import express from 'express';
import {
  processScreenshot,
  getItems,
  getItemById,
  updateItem,
  deleteItem,
  confirmItem,
  keepItem
} from '../controllers/itemController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadTemporaryScreenshot } from '../middleware/upload.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { attachDailyWarning } from '../middleware/dailyWarning.js';

const router = express.Router();

router.use(requireAuth);

router.post(
  '/process',
  aiRateLimiter,
  uploadTemporaryScreenshot,
  attachDailyWarning,
  processScreenshot
);

router.get('/', attachDailyWarning, getItems);
router.get('/:id', attachDailyWarning, getItemById);
router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);

router.post('/:id/confirm', confirmItem);
router.post('/:id/keep', keepItem);

export default router;
