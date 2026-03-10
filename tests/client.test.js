const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/recouvra_test', { useNewUrlParser: true, useUnifiedTopology: true });
  await mongoose.connection.db.dropDatabase();
  await User.create({ name: 'Admin', email: 'admin2@example.com', password: 'password', role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: 'admin2@example.com', password: 'password' });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

test('Admin can create a client', async () => {
  const res = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client A', email: 'clienta@example.com' });
  expect(res.statusCode).toBe(201);
  expect(res.body).toHaveProperty('_id');
  expect(res.body.name).toBe('Client A');
});

test('Agent cannot create a client (403)', async () => {
  await User.create({ name: 'Agent', email: 'agent@example.com', password: 'password', role: 'agent' });
  const login = await request(app).post('/api/auth/login').send({ email: 'agent@example.com', password: 'password' });
  const agentToken = login.body.token;
  const res = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${agentToken}`)
    .send({ name: 'Client B' });
  expect(res.statusCode).toBe(403);
});
