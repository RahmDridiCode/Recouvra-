const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['unpaid', 'paid', 'overdue'], default: 'unpaid' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
