import { SnapItem } from '../models/SnapItem.js';
import { evaluateItemRetention, keepItem as extendRetention, purgeExpiredItems } from '../services/retention/retentionService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function getExpiringItems(req, res, next) {
  try {
    const userId = req.user.id;

    await evaluateItemRetention(userId);

    const items = await SnapItem.find({
      userId,
      'retention.status': 'retention'
    })
      .sort({ 'retention.expiresAt': 1 })
      .lean();

    return ApiResponse.success(res, { items });
  } catch (err) {
    next(err);
  }
}

export async function keepItem(req, res, next) {
  try {
    const item = await extendRetention(req.user.id, req.params.id);
    return ApiResponse.success(res, {
      item: item.toObject(),
      message: 'Item retention extended by 7 days'
    });
  } catch (err) {
    next(err);
  }
}

export async function purgeExpired(req, res, next) {
  try {
    const count = await purgeExpiredItems(req.user.id);
    return ApiResponse.success(res, {
      message: `Purged ${count} expired items`,
      count
    });
  } catch (err) {
    next(err);
  }
}
