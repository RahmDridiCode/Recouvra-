const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { hashPassword, comparePassword } = require('../utils/hash');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'manager', 'agent'], default: 'agent' }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await hashPassword(this.password);
  next();
});

UserSchema.methods.comparePassword = async function (candidate) {
  return await comparePassword(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
