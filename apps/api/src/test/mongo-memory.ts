import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export function ensureTestEnv(): void {
  process.env.NODE_ENV ??= 'test';
  process.env.LOG_LEVEL = 'silent';
  process.env.MONGODB_URI ??= 'mongodb://localhost:27017/veritas-libris-test';
  process.env.FIREBASE_PROJECT_ID ??= 'test-project';
  process.env.FIREBASE_CLIENT_EMAIL ??= 'test@example.com';
  process.env.FIREBASE_PRIVATE_KEY ??= 'dummy-test-private-key';
  process.env.ADMIN_EMAILS ??= '';
}

export async function startInMemoryMongo(): Promise<MongoMemoryServer> {
  ensureTestEnv();
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  return mongod;
}

export async function clearMongoDatabase(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections);
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
}

export async function stopInMemoryMongo(mongod?: MongoMemoryServer): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongod) {
    await mongod.stop();
  }
}
