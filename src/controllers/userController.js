const User = require('../models/User');
const { hashPassword } = require('../utils/hash');

async function createUser(req, res) {
  const { name, email, password, role } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });
    const user = new User({ name, email, password, role });
    await user.save();
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listUsers(req, res) {
  const users = await User.find().select('-password');
  res.json(users);
}

async function updateUser(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };

  try {
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }

    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');

    if (!user) return res.status(404).json({ message: 'Not found' });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function deleteUser(req, res) {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.json({ ok: true });
}

module.exports = { createUser, listUsers, updateUser, deleteUser };
