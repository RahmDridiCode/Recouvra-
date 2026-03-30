const RecoveryAction = require('../models/RecoveryAction');
const Client = require('../models/Client');
const Invoice = require('../models/Invoice');
const { sendRecoveryEmail } = require('../services/emailService');
const { sendRecoverySms } = require('../services/smsService');

async function createAction(req, res) {
  try {
    const actionData = { ...req.body };
    if (req.user) actionData.actionBy = req.user._id;

    const action = new RecoveryAction(actionData);
    await action.save();

    // Fetch invoice + client to send notification
    const invoice = await Invoice.findById(action.invoice).populate('client');
    let notificationResult = null;

    if (invoice && invoice.client) {
      const client   = invoice.client;
      const { amount, dueDate } = invoice;
      const description = action.description || '';

      if (action.actionType === 'email') {
        if (client.email) {
          notificationResult = await sendRecoveryEmail(
            client.email, client.name, amount, dueDate, description
          );
        } else {
          notificationResult = { success: false, error: 'Client has no email address' };
        }
      } else if (action.actionType === 'sms') {
        if (client.phone) {
          notificationResult = await sendRecoverySms(
            client.phone, client.name, amount, dueDate, description
          );
        } else {
          notificationResult = { success: false, error: 'Client has no phone number' };
        }
      }
    } else {
      notificationResult = { success: false, error: 'Invoice or client not found' };
    }

    res.status(201).json({ action, notification: notificationResult });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listActions(req, res) {
  const user = req.user;
  let filter = {};

  if (user.role === 'agent') {
    const clients  = await Client.find({ assignedTo: user._id }).select('_id');
    const invoices = await Invoice.find({
      client: { $in: clients.map(c => c._id) }
    }).select('_id');
    filter.invoice = { $in: invoices.map(i => i._id) };
  }

  const actions = await RecoveryAction
    .find(filter)
    .populate({ path: 'invoice', populate: { path: 'client' } })
    .populate('actionBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(actions);
}

module.exports = { createAction, listActions };
