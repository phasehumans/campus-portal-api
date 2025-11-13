require('dotenv').config({ path: '.env.test' });
const mongoose = require('mongoose');

// Connect to test database
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/campus-portal-test';
  await mongoose.connect(mongoUri);
});

// Disconnect after tests
afterAll(async () => {
  await mongoose.disconnect();
});

// Clear database before each test
beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
