import mongoose from 'mongoose';

// Cache connection across serverless invocations
let isConnected = false;

const connectDB = async (): Promise<void> => {
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is not defined');

  try {
    await mongoose.connect(uri, {
      dbName: 'smart-leads',
      serverSelectionTimeoutMS: 10000, // fail fast — 10s not 30s
      socketTimeoutMS: 45000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    throw error; // let the error handler catch it, don't process.exit()
  }
};

export default connectDB;
