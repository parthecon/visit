const User = require('../models/User');
const Company = require('../models/Company');

// Create a new employee
exports.createEmployee = async (req, res) => {
  try {
    const data = { ...req.body, role: 'employee' };
    const employee = await User.create(data);
    res.status(201).json({ status: 'success', data: { ...employee.toObject(), password: undefined } });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all employees
exports.getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .populate('companyId', 'name email');
    const sanitized = employees.map(e => { const obj = e.toObject(); delete obj.password; return obj; });
    res.json({ status: 'success', data: sanitized });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a single employee by ID
exports.getEmployee = async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' })
      .populate('companyId', 'name email');
    if (!employee) {
      return res.status(404).json({ status: 'error', message: 'Employee not found' });
    }
    const obj = employee.toObject();
    delete obj.password;
    res.json({ status: 'success', data: obj });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update an employee by ID
exports.updateEmployee = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.password;
    const employee = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'employee' },
      updates,
      { new: true, runValidators: true }
    ).populate('companyId', 'name email');
    if (!employee) {
      return res.status(404).json({ status: 'error', message: 'Employee not found' });
    }
    const obj = employee.toObject();
    delete obj.password;
    res.json({ status: 'success', data: obj });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Delete an employee by ID
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findOneAndDelete({ _id: req.params.id, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ status: 'error', message: 'Employee not found' });
    }
    res.json({ status: 'success', message: 'Employee deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 