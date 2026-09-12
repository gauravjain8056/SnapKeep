import { QdrantClient } from '@qdrant/js-client-rest';
import { config } from './env.js';

const VECTOR_SIZE = 3072;

let _client = null;

export function getQdrantClient() {
  if (!config.qdrantUrl) return null;
  if (!_client) {
    _client = new QdrantClient({
      url: config.qdrantUrl,
      apiKey: config.qdrantApiKey || undefined
    });
  }
  return _client;
}

export function isQdrantEnabled() {
  return Boolean(config.qdrantUrl);
}

export async function bootstrapQdrantCollection() {
  const client = getQdrantClient();
  if (!client) return;

  try {
    const exists = await client.collectionExists(config.qdrantCollection);
    if (!exists.exists) {
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
      console.log(`Qdrant collection '${config.qdrantCollection}' created.`);
    }
  } catch (err) {
    console.warn(`Qdrant bootstrap failed (search will use MongoDB only): ${err.message}`);
  }
}
