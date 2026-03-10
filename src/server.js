require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const { connectDB, createDefaultAdmin } = require('./config/db');

const PORT = process.env.PORT || 3001;
const User = require('./models/User');


connectDB().then(async () => {
  await createDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
