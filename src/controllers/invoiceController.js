const Invoice = require('../models/Invoice');
const Client = require('../models/Client');

async function createInvoice(req, res) {
  try {
    const inv = new Invoice(req.body);
    await inv.save();
    res.status(201).json(inv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listInvoices(req, res) {
  const user = req.user;
  let filter = {};
  if (user.role === 'agent') {
    const clients = await Client.find({ assignedTo: user._id }).select('_id');
    filter.client = { $in: clients.map(c => c._id) };
  }
  const invoices = await Invoice.find(filter).populate('client');
  res.json(invoices);
}

async function updateInvoice(req, res) {
  const { id } = req.params;
  const inv = await Invoice.findByIdAndUpdate(id, req.body, { new: true });
  if (!inv) return res.status(404).json({ message: 'Not found' });
  res.json(inv);
}

async function deleteInvoice(req, res) {
  const { id } = req.params;
  await Invoice.findByIdAndDelete(id);
  res.json({ ok: true });
}

module.exports = { createInvoice, listInvoices, updateInvoice, deleteInvoice };
