import express from 'express';
import { getExpiringItems, keepItem, purgeExpired } from '../controllers/retentionController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/expiring', getExpiringItems);
router.post('/:id/keep', keepItem);
router.post('/purge', purgeExpired);

export default router;
