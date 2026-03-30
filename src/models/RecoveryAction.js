const mongoose = require('mongoose');

const RecoveryActionSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  actionType: { type: String, enum: ['email', 'sms'], required: true },
  actionBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('RecoveryAction', RecoveryActionSchema);
