const User = require('../models/User');
const Company = require('../models/Company');

// Create a new receptionist
exports.createReceptionist = async (req, res) => {
  try {
    const data = { ...req.body, role: 'receptionist' };
    const receptionist = await User.create(data);
    res.status(201).json({ status: 'success', data: { ...receptionist.toObject(), password: undefined } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all receptionists
exports.getReceptionists = async (req, res) => {
  try {
    const receptionists = await User.find({ role: 'receptionist' })
      .populate('companyId', 'name email');
    const sanitized = receptionists.map(r => { const obj = r.toObject(); delete obj.password; return obj; });
    res.json({ status: 'success', data: sanitized });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a single receptionist by ID
exports.getReceptionist = async (req, res) => {
  try {
    const receptionist = await User.findOne({ _id: req.params.id, role: 'receptionist' })
      .populate('companyId', 'name email');
    if (!receptionist) {
      return res.status(404).json({ status: 'error', message: 'Receptionist not found' });
    }
    const obj = receptionist.toObject();
    delete obj.password;
    res.json({ status: 'success', data: obj });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a receptionist by ID
exports.updateReceptionist = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    const receptionist = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'receptionist' },
      updates,
      { new: true, runValidators: true }
    ).populate('companyId', 'name email');
    if (!receptionist) {
      return res.status(404).json({ status: 'error', message: 'Receptionist not found' });
    }
    const obj = receptionist.toObject();
    delete obj.password;
    res.json({ status: 'success', data: obj });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Delete a receptionist by ID
exports.deleteReceptionist = async (req, res) => {
  try {
    const receptionist = await User.findOneAndDelete({ _id: req.params.id, role: 'receptionist' });
    if (!receptionist) {
      return res.status(404).json({ status: 'error', message: 'Receptionist not found' });
    }
    res.json({ status: 'success', message: 'Receptionist deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 