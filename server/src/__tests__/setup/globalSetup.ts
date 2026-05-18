import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load test env vars
dotenv.config({ path: '.env' });

export default async function globalSetup() {
  // Use a separate test database to avoid polluting dev data
  const testUri = process.env.MONGO_URI!.replace(/\/\?/, '/smart-leads-test?');
  await mongoose.connect(testUri);
  console.log('✅ Test DB connected');
}
