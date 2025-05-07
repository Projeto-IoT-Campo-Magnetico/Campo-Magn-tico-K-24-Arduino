import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/ky024-db';

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
      family: 4 // Força IPv4
    });
    console.log('✅ MongoDB conectado via IPv4');
  } catch (err) {
    console.error('❌ Falha na conexão:', err instanceof Error ? err.message : String(err));
    process.exit(1);
  }
}

export function disconnectDB() {
  return mongoose.disconnect();
}