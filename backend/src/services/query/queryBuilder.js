import mongoose from 'mongoose';

export function buildStructuredQuery(userId, intent, userTimezone = 'Asia/Kolkata') {
  const query = {
    userId: new mongoose.Types.ObjectId(userId)
  };

  if (intent.category) {
    query.category = intent.category;
  }

  if (intent.priority) {
    query.priority = intent.priority;
  }

  if (intent.requireConfirmationOnly) {
    query.needsConfirmation = true;
  }

  const now = new Date();
  const dateQuery = calculateDateRange(intent.dateRangeType, now);

  if (dateQuery) {
    query.$or = [
      { deadline: dateQuery },
      { deadline: null, date: dateQuery }
    ];
  }

  return query;
}

export function calculateDateRange(rangeType, now = new Date()) {
  if (!rangeType || rangeType === 'none') return null;

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  switch (rangeType) {
    case 'today':
      return { $gte: startOfToday, $lte: endOfToday };

    case 'tomorrow': {
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      const endOfTomorrow = new Date(endOfToday);
      endOfTomorrow.setDate(endOfTomorrow.getDate() + 1);
      return { $gte: startOfTomorrow, $lte: endOfTomorrow };
    }

    case 'next_3_days': {
      const endOf3Days = new Date(startOfToday);
      endOf3Days.setDate(endOf3Days.getDate() + 3);
      return { $gte: startOfToday, $lte: endOf3Days };
    }

    case 'this_week': {
      const dayOfWeek = startOfToday.getDay();
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      const endOfWeek = new Date(endOfToday);
      endOfWeek.setDate(endOfWeek.getDate() + daysUntilSunday);
      return { $gte: startOfToday, $lte: endOfWeek };
    }

    case 'this_weekend': {
      const dayOfWeek = startOfToday.getDay();
      const daysToSaturday = (6 - dayOfWeek + 7) % 7;
      const satStart = new Date(startOfToday);
      satStart.setDate(satStart.getDate() + daysToSaturday);
      const sunEnd = new Date(endOfToday);
      sunEnd.setDate(sunEnd.getDate() + daysToSaturday + 1);
      return { $gte: satStart, $lte: sunEnd };
    }

    case 'next_week': {
      const dayOfWeek = startOfToday.getDay();
      const daysToNextMonday = ((1 - dayOfWeek + 7) % 7) || 7;
      const nextMonStart = new Date(startOfToday);
      nextMonStart.setDate(nextMonStart.getDate() + daysToNextMonday);
      const nextSunEnd = new Date(endOfToday);
      nextSunEnd.setDate(nextSunEnd.getDate() + daysToNextMonday + 6);
      return { $gte: nextMonStart, $lte: nextSunEnd };
    }

    case 'all_upcoming':
      return { $gte: startOfToday };

    case 'past':
      return { $lt: startOfToday };

    default:
      return null;
  }
}

export const QueryBuilder = {
  buildStructuredQuery,
  calculateDateRange
};
