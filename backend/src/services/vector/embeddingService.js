import { GoogleGenAI } from '@google/genai';
import { config } from '../../config/env.js';

const EMBEDDING_MODEL = config.embeddingModel || 'gemini-embedding-001';

const _aiClient = config.geminiApiKey
  ? new GoogleGenAI({ apiKey: config.geminiApiKey })
  : null;

function buildItemText(item) {
  return [
    item.title,
    item.description,
    item.subject,
    item.action,
    item.category,
    item.relevance,
    item.originalCaption
  ]
    .filter(Boolean)
    .join(' | ');
}

export async function embedText(text, taskType = 'RETRIEVAL_QUERY') {
  if (!_aiClient) return null;
  try {
    const result = await _aiClient.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        taskType
      }
    });
    return result.embeddings?.[0]?.values || null;
  } catch (err) {
    console.warn(`Embedding failed: ${err.message}`);
    return null;
  }
}

export async function embedItem(item) {
  const text = buildItemText(item);
  if (!text) return null;
  return embedText(text, 'RETRIEVAL_DOCUMENT');
}

