import { parseIntent } from '../services/query/intentParser.js';
import { buildStructuredQuery } from '../services/query/queryBuilder.js';
import { searchUserItems, synthesizeAnswer } from '../services/query/searchService.js';
import { getQueryCacheKey, cacheGet, cacheSet } from '../services/cache/cacheService.js';
import { SnapItem } from '../models/SnapItem.js';
import { ApiResponse } from '../utils/apiResponse.js';

export async function handleQuery(req, res, next) {
  try {
    const { query } = req.body;
    const userId = req.user.id;
    const timezone = req.user.timezone || 'Asia/Kolkata';

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return ApiResponse.error(res, 'Search query cannot be empty', 'INVALID_QUERY', 400);
    }

    const cleanQuery = query.trim();

    const cacheKey = getQueryCacheKey(userId, cleanQuery);
    const cached = await cacheGet(cacheKey);

    if (cached) {
      console.log(`Serving cached query result for user ${userId}`);
      return ApiResponse.success(res, {
        ...cached,
        fromCache: true
      });
    }

    const intent = await parseIntent(cleanQuery, timezone);

    let items = [];

    if (intent.searchType === 'structured') {
      const mongoQuery = buildStructuredQuery(userId, intent, timezone);
      items = await SnapItem.find(mongoQuery)
        .sort({ deadline: 1, priority: 1, createdAt: -1 })
        .limit(20)
        .lean();
    } else {
      items = await searchUserItems(userId, cleanQuery, intent, 20);
    }

    const answer = await synthesizeAnswer(cleanQuery, items);

    const responsePayload = {
      query: cleanQuery,
      answer,
      items,
      intent,
      fromCache: false
    };

    await cacheSet(cacheKey, responsePayload, 600);

    return ApiResponse.success(res, responsePayload);
  } catch (err) {
    next(err);
  }
}
