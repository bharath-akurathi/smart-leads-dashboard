import mongoose from 'mongoose';

export default async function globalTeardown() {
  // Drop the test database and disconnect
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  console.log('✅ Test DB cleaned up');
}
