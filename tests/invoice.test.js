const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const User = require('../src/models/User');
const Client = require('../src/models/Client');

let token;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/recouvra_test', { useNewUrlParser: true, useUnifiedTopology: true });
  await mongoose.connection.db.dropDatabase();
  await User.create({ name: 'Admin', email: 'admin3@example.com', password: 'password', role: 'admin' });
  const res = await request(app).post('/api/auth/login').send({ email: 'admin3@example.com', password: 'password' });
  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

test('Admin can create invoice for a client', async () => {
  const clientRes = await request(app)
    .post('/api/clients')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Client X' });
  expect(clientRes.statusCode).toBe(201);
  const clientId = clientRes.body._id;

  const invRes = await request(app)
    .post('/api/invoices')
    .set('Authorization', `Bearer ${token}`)
    .send({ client: clientId, amount: 100.5, dueDate: new Date().toISOString() });
  expect(invRes.statusCode).toBe(201);
  expect(invRes.body).toHaveProperty('_id');
  expect(invRes.body.amount).toBe(100.5);
});
