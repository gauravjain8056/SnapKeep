import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './env.js';

const VECTOR_SIZE = 3072;

let _client = null;

export function getQdrantClient() {
  if (!config.qdrantUrl) return null;
  if (!_client) {
    let url = config.qdrantUrl.trim().replace(/\/+$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    _client = new QdrantClient({
      url,
      apiKey: config.qdrantApiKey ? config.qdrantApiKey.trim() : undefined,
      checkCompatibility: false
    });
  }
  return _client;
}

export function isQdrantEnabled() {
  return Boolean(config.qdrantUrl);
}

export async function bootstrapQdrantCollection() {
  const client = getQdrantClient();
  if (!client) {
    console.log('[Qdrant] Skipped bootstrap: QDRANT_URL is not set.');
    return;
  }

  try {
    const exists = await client.collectionExists(config.qdrantCollection);
    if (exists && exists.exists) {
      // Verify existing collection dimension
      const info = await client.getCollection(config.qdrantCollection);
      const currentSize = info?.config?.params?.vectors?.size;
      if (currentSize && currentSize !== VECTOR_SIZE) {
        console.warn(`[Qdrant] Collection '${config.qdrantCollection}' has vector size ${currentSize}, expected ${VECTOR_SIZE}. Recreating collection...`);
        await client.deleteCollection(config.qdrantCollection);
        await client.createCollection(config.qdrantCollection, {
          vectors: {
            size: VECTOR_SIZE,
            distance: 'Cosine'
          }
        });
        await client.createPayloadIndex(config.qdrantCollection, {
          field_name: 'userId',
          field_schema: 'keyword'
        });
        console.log(`[Qdrant] Recreated collection '${config.qdrantCollection}' with vector size ${VECTOR_SIZE}.`);
      } else {
        console.log(`[Qdrant] Collection '${config.qdrantCollection}' is ready (vector size ${VECTOR_SIZE}).`);
      }
    } else {
      await client.createCollection(config.qdrantCollection, {
        vectors: {
          size: VECTOR_SIZE,
          distance: 'Cosine'
        }
      });
      await client.createPayloadIndex(config.qdrantCollection, {
        field_name: 'userId',
        field_schema: 'keyword'
      });
      console.log(`[Qdrant] Collection '${config.qdrantCollection}' created with vector size ${VECTOR_SIZE}.`);
    }
  } catch (err) {
    console.warn(`[Qdrant] Bootstrap failed (search will use MongoDB only): ${err.message}`);
  }
}
