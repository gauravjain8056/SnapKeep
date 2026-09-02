import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';

const PORT = config.port;
const HOST = '0.0.0.0';

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, HOST, () => {
    console.log(`================================================`);
    console.log(`🚀 SnapKeep Backend Server running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Health Endpoint: http://${HOST}:${PORT}/health`);
    console.log(`================================================`);
  });

  const shutdown = () => {
    console.log('Shutting down SnapKeep server...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer();
