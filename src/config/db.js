const mongoose = require('mongoose');
const User = require('../models/User');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/recouvra';
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
  console.log('MongoDB connected');
};
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

module.exports = {connectDB, createDefaultAdmin};
