const request = require('supertest');
const app = require('../../src/app');
const mongoose = require('mongoose');
const User = require('../../src/models/User');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/recouvra_test', { useNewUrlParser: true, useUnifiedTopology: true });
  await User.deleteMany({});
  await User.create({ name: 'Admin', email: 'admin@example.com', password: 'password', role: 'admin' });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

test('POST /api/auth/login returns token', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'password' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('token');
});
