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

  const vector = await embedItem(item);
  if (!vector) return;

  await client.upsert(config.qdrantCollection, {
    wait: false,
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
}

export async function deleteItemVector(mongoId) {
  if (!isQdrantEnabled()) return;
  const client = getQdrantClient();
  if (!client) return;

  await client.delete(config.qdrantCollection, {
    wait: false,
    points: [mongoIdToUuid(mongoId)]
  });
}

export async function qdrantSearch(userId, queryText, limit = 20) {
  if (!isQdrantEnabled()) return [];
  const client = getQdrantClient();
  if (!client) return [];

  const vector = await embedText(queryText, 'RETRIEVAL_QUERY');
  if (!vector) return [];

  try {
    const results = await client.search(config.qdrantCollection, {
      vector,
      limit,
      filter: {
        must: [{ key: 'userId', match: { value: userId.toString() } }]
      },
      with_payload: true,
      score_threshold: 0.5
    });
    return results.map((r) => r.payload.mongoId).filter(Boolean);
  } catch (err) {
    console.warn(`Qdrant search failed, falling back to MongoDB only: ${err.message}`);
    return [];
  }
}
