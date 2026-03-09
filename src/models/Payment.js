const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  method: { type: String, enum: ['cash', 'bank transfer', 'cheque'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
