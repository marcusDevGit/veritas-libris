import { buildApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { env } from './config/env.js';

async function main(): Promise<void> {
  const app = buildApp();

  try {
    await connectDatabase(env.MONGODB_URI);
    app.log.info('MongoDB conectado');

    await app.listen({ host: env.HOST, port: env.PORT });
  } catch (error) {
    app.log.error({ err: error }, 'Falha ao iniciar o servidor');
    await disconnectDatabase().catch(() => undefined);
    process.exit(1);
  }

  const shutdown = async (signal: string): Promise<void> => {
    app.log.info(`${signal} recebido, encerrando...`);
    await app.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
}

void main();
