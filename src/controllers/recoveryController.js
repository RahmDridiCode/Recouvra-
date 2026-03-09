const RecoveryAction = require('../models/RecoveryAction');

async function createAction(req, res) {
  try {
    const action = new RecoveryAction(req.body);
    await action.save();
    res.status(201).json(action);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listActions(req, res) {
  const user = req.user;
  let filter = {};

  if (user.role === 'agent') {

    const clients = await Client.find({ assignedTo: user._id }).select('_id');

    const invoices = await Invoice.find({
      client: { $in: clients.map(c => c._id) }
    }).select('_id');

    filter.invoice = { $in: invoices.map(i => i._id) };
  }

  const actions = await RecoveryAction
    .find(filter)
    .populate({
      path: 'invoice',
      populate: { path: 'client' }
    });

  res.json(actions);
}

module.exports = { createAction, listActions };
