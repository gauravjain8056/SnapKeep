import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ApiResponse } from './utils/apiResponse.js';

import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import retentionRoutes from './routes/retentionRoutes.js';

import { getQdrantClient, isQdrantEnabled } from './config/qdrant.js';

const app = express();

app.use(helmet());

const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || !config.isProduction) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'snapkeep-backend'
  });
});

app.get('/api/qdrant-status', async (req, res) => {
  const isEnabled = isQdrantEnabled();
  let connectionStatus = isEnabled ? 'connecting' : 'disabled';
  let details = null;

  if (isEnabled) {
    try {
      const client = getQdrantClient();
      const collections = await client.getCollections();
      const exists = await client.collectionExists(config.qdrantCollection);
      let collectionInfo = null;
      if (exists && exists.exists) {
        collectionInfo = await client.getCollection(config.qdrantCollection);
      }
      connectionStatus = 'connected';
      details = {
        collections: collections?.collections?.map((c) => c.name) || [],
        targetCollection: config.qdrantCollection,
        targetExists: Boolean(exists && exists.exists),
        vectorSize: collectionInfo?.config?.params?.vectors?.size,
        pointsCount: collectionInfo?.points_count
      };
    } catch (err) {
      connectionStatus = 'error';
      details = { error: err.message };
    }
  }

  return res.json({
    qdrantEnabled: isEnabled,
    qdrantUrlConfigured: Boolean(config.qdrantUrl),
    qdrantApiKeyConfigured: Boolean(config.qdrantApiKey),
    embeddingModel: config.embeddingModel,
    connectionStatus,
    details
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/retention', retentionRoutes);

app.use('*', (req, res) => {
  return ApiResponse.error(res, `Route ${req.originalUrl} not found`, 'NOT_FOUND', 404);
});

app.use(errorHandler);

export default app;
