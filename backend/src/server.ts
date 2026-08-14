import { app } from './app';
import { config } from './config';
import { connectDB } from './db/prisma';

async function startServer() {
  await connectDB();

  const server = app.listen(config.port, () => {
    console.log(`
  🌿 =========================================================
  🧠  MindEase Mental Health & CBT Platform API Started!
  📡  Server Port: http://localhost:${config.port}
  🔒  Security: TOTP MFA, AES-256 at-rest encryption, Helmet, Rate Limit
  🤖  AI Companion: USHA (CBT-aligned + Crisis Safety Engine)
  🌿 =========================================================
    `);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received, closing HTTP server...');
    server.close(() => {
      console.log('HTTP server closed.');
    });
  });
}

startServer().catch(err => {
  console.error('Failed to start MindEase backend server:', err);
  process.exit(1);
});
