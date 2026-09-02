import { SnapItem } from '../../models/SnapItem.js';
import { User } from '../../models/User.js';

export function getCalendarDateString(date, timezone = 'Asia/Kolkata') {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(date);
  } catch {
    return date.toISOString().split('T')[0];
  }
}

export function isFirstInteractionOfDay(lastInteractionDate, timezone = 'Asia/Kolkata') {
  if (!lastInteractionDate) return true;
  const now = new Date();
  const todayStr = getCalendarDateString(now, timezone);
  const lastStr = getCalendarDateString(new Date(lastInteractionDate), timezone);
  return todayStr !== lastStr;
}

export async function evaluateItemRetention(userId) {
  const now = new Date();

  const activeItems = await SnapItem.find({
    userId,
    'retention.status': 'active',
    $or: [
      { deadline: { $ne: null, $lt: now } },
      { deadline: null, date: { $ne: null, $lt: now } }
    ]
  });

  const updatedItems = [];
  for (const item of activeItems) {
    const meaningfulDate = item.deadline || item.date;
    if (meaningfulDate) {
      const expiresAt = new Date(meaningfulDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      item.retention.status = 'retention';
      item.retention.expiresAt = expiresAt;
      await item.save();
      updatedItems.push(item);
    }
  }

  return updatedItems;
}

export async function checkDailyDeletionWarning(user) {
  if (!user || !user.id) return null;

  const userDoc = await User.findById(user.id);
  if (!userDoc) return null;

  const timezone = userDoc.timezone || 'Asia/Kolkata';
  const isFirst = isFirstInteractionOfDay(userDoc.lastInteractionDate, timezone);

  await User.findByIdAndUpdate(userDoc._id, { lastInteractionDate: new Date() });

  if (!isFirst) {
    return null;
  }

  await evaluateItemRetention(userDoc._id);

  const expiringItems = await SnapItem.find({
    userId: userDoc._id,
    'retention.status': 'retention',
    'retention.expiresAt': { $ne: null }
  }).sort({ 'retention.expiresAt': 1 }).limit(10);

  if (expiringItems.length === 0) {
    return null;
  }

  return {
    showWarning: true,
    count: expiringItems.length,
    message: `Before you go: ${expiringItems.length} saved ${expiringItems.length === 1 ? 'item' : 'items'} will be deleted soon because their deadline has passed.`,
    items: expiringItems.map(item => ({
      id: item._id,
      title: item.title,
      category: item.category,
      expiresAt: item.retention.expiresAt,
      extendedCount: item.retention.extendedCount
    }))
  };
}

export async function keepItem(userId, itemId) {
  const item = await SnapItem.findOne({ _id: itemId, userId });
  if (!item) {
    const error = new Error('SnapItem not found or access denied');
    error.code = 'ITEM_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  const currentExpiresAt = item.retention.expiresAt || new Date();
  const newExpiresAt = new Date(new Date(currentExpiresAt).getTime() + 7 * 24 * 60 * 60 * 1000);

  item.retention.status = 'retention';
  item.retention.expiresAt = newExpiresAt;
  item.retention.extendedCount = (item.retention.extendedCount || 0) + 1;

  await item.save();
  return item;
}

export async function purgeExpiredItems(userId = null) {
  const now = new Date();
  const query = {
    'retention.status': 'retention',
    'retention.expiresAt': { $lt: now }
  };

  if (userId) {
    query.userId = userId;
  }

  const result = await SnapItem.deleteMany(query);
  console.log(`Purged ${result.deletedCount} expired items.`);
  return result.deletedCount;
}

export const RetentionService = {
  getCalendarDateString,
  isFirstInteractionOfDay,
  evaluateItemRetention,
  checkDailyDeletionWarning,
  keepItem,
  purgeExpiredItems
};
