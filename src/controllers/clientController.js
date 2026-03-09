const Client = require('../models/Client');

async function createClient(req, res) {
  const payload = req.body;
  try {
    const client = new Client(payload);
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listClients(req, res) {
  const user = req.user;
  const filter = {};
  if (user.role === 'agent') filter.assignedTo = user._id;
  const clients = await Client.find(filter).populate('assignedTo', 'name email');
  res.json(clients);
}

async function updateClient(req, res) {
  const { id } = req.params;
  const updates = req.body;
  const client = await Client.findByIdAndUpdate(id, updates, { new: true });
  if (!client) return res.status(404).json({ message: 'Not found' });
  res.json(client);
}

async function deleteClient(req, res) {
  const { id } = req.params;
  await Client.findByIdAndDelete(id);
  res.json({ ok: true });
}

module.exports = { createClient, listClients, updateClient, deleteClient };
