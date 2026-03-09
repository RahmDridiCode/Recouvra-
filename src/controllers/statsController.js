const Invoice = require('../models/Invoice');

async function stats(req, res) {
  const totalInvoices = await Invoice.countDocuments();
  const unpaid = await Invoice.countDocuments({ status: 'unpaid' });
  const paid = await Invoice.countDocuments({ status: 'paid' });
  const overdue = await Invoice.countDocuments({ status: 'overdue' });
  res.json({ totalInvoices, unpaid, paid, overdue });
}

module.exports = { stats };
