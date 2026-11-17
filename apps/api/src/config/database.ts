import mongoose from 'mongoose';

export type DatabaseState = 'disconnected' | 'connected' | 'connecting' | 'disconnecting';

export async function connectDatabase(uri: string): Promise<void> {
  mongoose.set('strictQuery', true);

  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10_000,
  });
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}

/** Traduz o enum do Mongoose para um conjunto pequeno de estados que expomos no /health. */
export function getDatabaseState(): DatabaseState {
  switch (mongoose.connection.readyState) {
    case mongoose.STATES.connected:
      return 'connected';
    case mongoose.STATES.connecting:
      return 'connecting';
    case mongoose.STATES.disconnecting:
      return 'disconnecting';
    default:
      return 'disconnected';
  }
}
