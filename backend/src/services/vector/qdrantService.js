import crypto from 'crypto';
import { getQdrantClient, isQdrantEnabled } from '../../config/qdrant.js';
import { embedItem, embedText } from './embeddingService.js';
import { config } from '../../config/env.js';

function mongoIdToUuid(mongoId) {
  const hash = crypto.createHash('md5').update(mongoId.toString()).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

export async function upsertItemVector(item) {
  if (!isQdrantEnabled()) return;
  const client = getQdrantClient();
  if (!client) return;

  try {
    const vector = await embedItem(item);
    if (!vector) {
      console.warn(`[Qdrant] Failed to generate embedding for item ${item._id}`);
      return;
    }

    await client.upsert(config.qdrantCollection, {
      wait: true,
      points: [
        {
          id: mongoIdToUuid(item._id),
          vector,
          payload: {
            mongoId: item._id.toString(),
            userId: item.userId.toString()
          }
        }
      ]
    });
    console.log(`[Qdrant] Indexed vector for item "${item.title}" (${item._id})`);
  } catch (err) {
    console.error(`[Qdrant] Failed to upsert vector for item ${item._id}:`, err.message);
  }
}

export async function deleteItemVector(mongoId) {
  if (!isQdrantEnabled()) return;
  const client = getQdrantClient();
  if (!client) return;

  try {
    await client.delete(config.qdrantCollection, {
      wait: true,
      points: [mongoIdToUuid(mongoId)]
    });
    console.log(`[Qdrant] Deleted vector for item ${mongoId}`);
  } catch (err) {
    console.warn(`[Qdrant] Failed to delete vector for item ${mongoId}:`, err.message);
  }
}

export async function qdrantSearch(userId, queryText, limit = 20) {
  if (!isQdrantEnabled()) return [];
  const client = getQdrantClient();
  if (!client) return [];

  const vector = await embedText(queryText, 'RETRIEVAL_QUERY');
  if (!vector) {
    console.warn('[Qdrant] Failed to generate query embedding.');
    return [];
  }

  try {
    let points = [];
    if (typeof client.query === 'function') {
      const response = await client.query(config.qdrantCollection, {
        query: vector,
        limit,
        filter: {
          must: [{ key: 'userId', match: { value: userId.toString() } }]
        },
        with_payload: true,
        score_threshold: 0.3
      });
      points = response?.points || [];
    } else if (typeof client.search === 'function') {
      points = await client.search(config.qdrantCollection, {
        vector,
        limit,
        filter: {
          must: [{ key: 'userId', match: { value: userId.toString() } }]
        },
        with_payload: true,
        score_threshold: 0.3
      });
    }

    console.log(`[Qdrant] Search for "${queryText}" yielded ${points.length} hit(s). Scores:`, points.map((r) => r.score?.toFixed(3)));
    return points.map((r) => r.payload?.mongoId).filter(Boolean);
  } catch (err) {
    console.warn(`[Qdrant] Search failed, falling back to MongoDB only: ${err.message}`);
    return [];
  }
}

