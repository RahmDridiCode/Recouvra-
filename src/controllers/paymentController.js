const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

async function createPayment(req, res) {
  try {
    const { invoice: invoiceId, amount } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    if (amount !== invoice.amount) {
      return res.status(400).json({
        message: `Payment amount must be exactly ${invoice.amount}`
      });
    }
    const pay = new Payment(req.body);
    await pay.save();

    invoice.status = 'paid';
    await invoice.save();

    res.status(201).json(pay);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listPayments(req, res) {
  const user = req.user; 
  let filter = {};

  if (user.role === 'agent') {
    const clients = await Client.find({ assignedTo: user._id }).select('_id');
    const invoices = await Invoice.find({
      client: { $in: clients.map(c => c._id) }
    }).select('_id');

    filter.invoice = { $in: invoices.map(i => i._id) };
  }
  const payments = await Payment.find(filter).populate('invoice');

  res.json(payments);
}

async function updatePayment(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body; 
  
    const payment = await Payment.findByIdAndUpdate(id, updates, { new: true });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });


    const invoice = await Invoice.findById(payment.invoice);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });

    if (updates.status && ['unpaid', 'paid', 'overdue'].includes(updates.status)) {
      invoice.status = updates.status;
      await invoice.save();
    }

    res.json({ payment, invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


module.exports = { createPayment, listPayments, updatePayment };
