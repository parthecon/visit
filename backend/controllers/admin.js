const User = require('../models/User');
const Company = require('../models/Company');

// Create a new admin (company_admin)
exports.createAdmin = async (req, res) => {
  try {
    const data = { ...req.body, role: 'company_admin' };
    const admin = await User.create(data);
    res.status(201).json({ status: 'success', data: { ...admin.toObject(), password: undefined } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all admins (company_admin)
exports.getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'company_admin' })
      .populate('companyId', 'name email');
    const sanitized = admins.map(a => { const obj = a.toObject(); delete obj.password; return obj; });
    res.json({ status: 'success', data: sanitized });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a single admin by ID
exports.getAdmin = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: 'company_admin' })
      .populate('companyId', 'name email');
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }
    const obj = admin.toObject();
    delete obj.password;
    res.json({ status: 'success', data: obj });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update an admin by ID
exports.updateAdmin = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password; // Password should be updated via a separate endpoint
    const admin = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'company_admin' },
      updates,
      { new: true, runValidators: true }
    ).populate('companyId', 'name email');
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }
    const obj = admin.toObject();
    delete obj.password;
    res.json({ status: 'success', data: obj });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Delete an admin by ID
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await User.findOneAndDelete({ _id: req.params.id, role: 'company_admin' });
    if (!admin) {
      return res.status(404).json({ status: 'error', message: 'Admin not found' });
    }
    res.json({ status: 'success', message: 'Admin deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 