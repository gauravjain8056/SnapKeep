import { SnapItem } from '../models/SnapItem.js';
import { extractFromScreenshot } from '../services/ai/visionExtractor.js';
import { evaluateItemRetention, keepItem as extendItemRetention } from '../services/retention/retentionService.js';
import { getQueryCacheKey, cacheGet, cacheSet, invalidatePattern } from '../services/cache/cacheService.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { config } from '../config/env.js';

export async function processScreenshot(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) {
      return ApiResponse.error(res, 'No screenshot image uploaded', 'MISSING_IMAGE', 400);
    }

    const userCaption = (req.body.caption || '').trim().slice(0, 1000);
    const mimeType = req.file.mimetype || 'image/jpeg';

    console.log(`Extracting circular memories for user ${req.user.id}. Caption: "${userCaption}"`);

    const extractedItems = await extractFromScreenshot(
      req.file.buffer,
      mimeType,
      userCaption
    );

    const createdItems = [];

    for (const itemData of extractedItems) {
      const snapItem = await SnapItem.create({
        userId: req.user.id,
        title: itemData.title,
        description: itemData.description,
        category: itemData.category,
        subject: itemData.subject,
        deadline: itemData.deadline,
        date: itemData.date,
        time: itemData.time,
        action: itemData.action,
        priority: itemData.priority,
        relevance: itemData.relevance,
        relevanceCategory: itemData.relevanceCategory || 'general',
        originalCaption: userCaption,
        sourceType: 'screenshot',
        confidence: itemData.confidence,
        needsConfirmation: itemData.needsConfirmation,
        confirmationReason: itemData.confirmationReason,
        processing: {
          aiModel: config.geminiModel || 'gemini-1.5-flash',
          processedAt: new Date()
        },
        retention: {
          status: 'active',
          expiresAt: null,
          extendedCount: 0
        }
      });

      createdItems.push(snapItem);
    }

    await invalidatePattern(`nlq:${req.user.id}:*`);

    const anyNeedsConfirmation = createdItems.some((i) => i.needsConfirmation);
    return ApiResponse.success(
      res,
      {
        items: createdItems,
        item: createdItems[0],
        count: createdItems.length,
        message: anyNeedsConfirmation
          ? `Extracted ${createdItems.length} item(s). Note: Some dates or details require your verification.`
          : `Extracted and saved ${createdItems.length} item(s) successfully.`
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function getItems(req, res, next) {
  try {
    const userId = req.user.id;

    await evaluateItemRetention(userId);

    const {
      category,
      priority,
      relevanceCategory,
      status,
      needsConfirmation,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      limit = 50,
      page = 1
    } = req.query;

    const filter = { userId };

    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    if (relevanceCategory) filter.relevanceCategory = relevanceCategory;
    if (status) filter['retention.status'] = status;
    if (needsConfirmation !== undefined) {
      filter.needsConfirmation = needsConfirmation === 'true';
    }

    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { subject: searchRegex },
        { action: searchRegex },
        { originalCaption: searchRegex }
      ];
    }

    const sortOptions = {};
    if (sortBy === 'deadline') {
      sortOptions.deadline = order === 'asc' ? 1 : -1;
    } else if (sortBy === 'priority') {
      sortOptions.priority = 1;
    } else {
      sortOptions.createdAt = order === 'asc' ? 1 : -1;
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const items = await SnapItem.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await SnapItem.countDocuments(filter);

    return ApiResponse.success(res, {
      items,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        pages: Math.ceil(total / parseInt(limit, 10))
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function getItemById(req, res, next) {
  try {
    const item = await SnapItem.findOne({
      _id: req.params.id,
      userId: req.user.id
    }).lean();

    if (!item) {
      return ApiResponse.error(res, 'SnapItem not found', 'ITEM_NOT_FOUND', 404);
    }

    return ApiResponse.success(res, { item });
  } catch (err) {
    next(err);
  }
}

export async function updateItem(req, res, next) {
  try {
    const item = await SnapItem.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      return ApiResponse.error(res, 'SnapItem not found', 'ITEM_NOT_FOUND', 404);
    }

    const allowedUpdates = [
      'title',
      'description',
      'category',
      'subject',
      'deadline',
      'date',
      'time',
      'action',
      'priority',
      'relevance',
      'relevanceCategory',
      'originalCaption'
    ];

    for (const field of allowedUpdates) {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    }

    await item.save();
    await invalidatePattern(`nlq:${req.user.id}:*`);

    return ApiResponse.success(res, {
      item: item.toObject(),
      message: 'Item updated successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function confirmItem(req, res, next) {
  try {
    const item = await SnapItem.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      return ApiResponse.error(res, 'SnapItem not found', 'ITEM_NOT_FOUND', 404);
    }

    const { deadline, date, time, action, title, category, priority, relevanceCategory } = req.body;

    if (deadline !== undefined) item.deadline = deadline ? new Date(deadline) : null;
    if (date !== undefined) item.date = date ? new Date(date) : null;
    if (time !== undefined) item.time = time;
    if (action !== undefined) item.action = action;
    if (title !== undefined) item.title = title;
    if (category !== undefined) item.category = category;
    if (priority !== undefined) item.priority = priority;
    if (relevanceCategory !== undefined) item.relevanceCategory = relevanceCategory;

    item.needsConfirmation = false;
    item.confirmationReason = null;
    item.confidence = 1.0;

    await item.save();
    await invalidatePattern(`nlq:${req.user.id}:*`);

    return ApiResponse.success(res, {
      item: item.toObject(),
      message: 'Details confirmed successfully'
    });
  } catch (err) {
    next(err);
  }
}

export async function keepItem(req, res, next) {
  try {
    const item = await extendItemRetention(req.user.id, req.params.id);
    return ApiResponse.success(res, {
      item: item.toObject(),
      message: `Retention extended by 7 days. New expiration: ${item.retention.expiresAt.toLocaleDateString()}`
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteItem(req, res, next) {
  try {
    const item = await SnapItem.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!item) {
      return ApiResponse.error(res, 'SnapItem not found', 'ITEM_NOT_FOUND', 404);
    }

    await invalidatePattern(`nlq:${req.user.id}:*`);

    return ApiResponse.success(res, { message: 'Item deleted successfully' });
  } catch (err) {
    next(err);
  }
}
