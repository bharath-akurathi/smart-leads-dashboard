import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async (): Promise<void> => {
  // If already connected, reuse the active connection instance
  if (isConnected) {
    console.log('✅ Using existing MongoDB connection');
    return;
  }

  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    const conn = await mongoose.connect(mongoURI, {
      dbName: 'smart-leads',
    });

    isConnected = !!conn.connections[0].readyState;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    // CRITICAL: Do NOT use process.exit(1) here for Vercel.
    // Instead, throw the error so the serverless function framework can log it.
    throw error; 
  }
};

export default connectDB;
