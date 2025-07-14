const Visitor = require('../models/Visitor');
const User = require('../models/User');
const Company = require('../models/Company');

// Create a new visitor
exports.createVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.create(req.body);
    res.status(201).json({ status: 'success', data: visitor });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Get all visitors (optionally filter by company, host, status, etc.)
exports.getVisitors = async (req, res) => {
  try {
    const query = { ...req.query };
    const visitors = await Visitor.find(query)
      .populate('hostId', 'name email role')
      .populate('companyId', 'name email')
      .populate('receptionistId', 'name email');
    res.json({ status: 'success', data: visitors });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get a single visitor by ID
exports.getVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate('hostId', 'name email role')
      .populate('companyId', 'name email')
      .populate('receptionistId', 'name email');
    if (!visitor) {
      return res.status(404).json({ status: 'error', message: 'Visitor not found' });
    }
    res.json({ status: 'success', data: visitor });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Update a visitor by ID
exports.updateVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!visitor) {
      return res.status(404).json({ status: 'error', message: 'Visitor not found' });
    }
    res.json({ status: 'success', data: visitor });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Delete a visitor by ID
exports.deleteVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndDelete(req.params.id);
    if (!visitor) {
      return res.status(404).json({ status: 'error', message: 'Visitor not found' });
    }
    res.json({ status: 'success', message: 'Visitor deleted' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 