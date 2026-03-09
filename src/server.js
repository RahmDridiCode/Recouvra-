require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3001;
const User = require('./models/User');

async function createDefaultAdmin() {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
    
      const user = new User({
        name: 'Admin',
        email: 'admin@recouvra.com',
        password: 'admin123',
        role: 'admin'
      });
      await user.save();
      console.log(' Admin par défaut créé : admin@recouvra.com / admin123');
    } else {
      console.log('ℹ Admin déjà existant');
    }
  } catch (err) {
    console.error('Erreur lors de la création de l’admin par défaut :', err.message || err);
  }
}

connectDB().then(async () => {
  // Create default admin after DB connection
  await createDefaultAdmin();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
