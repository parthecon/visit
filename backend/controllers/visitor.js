const Visitor = require('../models/Visitor');
const User = require('../models/User');
const Company = require('../models/Company');

// Create a new visitor
exports.createVisitor = async (req, res) => {
  try {
    const visitorData = {
      ...req.body
    };
    if (!visitorData.status) {
      visitorData.status = 'pending';
    }
    const visitor = await Visitor.create(visitorData);
    // Fetch host and receptionist
    const host = visitor.hostId ? await User.findById(visitor.hostId) : null;
    const receptionist = visitor.receptionistId ? await User.findById(visitor.receptionistId) : null;
    // Ensure companyId is set from host if not provided
    if (!visitor.companyId && host && host.companyId) {
      visitor.companyId = host.companyId;
      await visitor.save();
    }
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

// Approve a visitor
exports.approveVisitor = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { status: 'checked_in', checkInTime: new Date() },
      { new: true, runValidators: true }
    );
    if (!visitor) {
      return res.status(404).json({ status: 'error', message: 'Visitor not found' });
    }
    // Fetch receptionist
    const receptionist = visitor.receptionistId ? await User.findById(visitor.receptionistId) : null;
    const host = visitor.hostId ? await User.findById(visitor.hostId) : null;
    res.json({ status: 'success', data: visitor });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Reject a visitor
exports.rejectVisitor = async (req, res) => {
  try {
    const update = { status: 'rejected' };
    if (req.body.rejectionReason) update.rejectionReason = req.body.rejectionReason;
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );
    if (!visitor) {
      return res.status(404).json({ status: 'error', message: 'Visitor not found' });
    }
    res.json({ status: 'success', data: visitor });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Visitor checkout
exports.checkoutVisitor = async (req, res) => {
  try {
    const { phoneOrEmail } = req.body;
    if (!phoneOrEmail) {
      return res.status(400).json({ status: 'error', message: 'Phone or email is required' });
    }
    // Find visitor who is currently checked in or approved
    const visitor = await Visitor.findOne({
      $or: [
        { phone: phoneOrEmail },
        { email: phoneOrEmail }
      ],
      status: { $in: ['checked_in', 'approved'] }
    });
    if (!visitor) {
      return res.status(404).json({ status: 'error', message: 'No checked-in visitor found with this phone or email' });
    }
    visitor.status = 'checked_out';
    visitor.checkOutTime = new Date();
    await visitor.save();
    res.json({ status: 'success', message: 'Checked out successfully', data: visitor });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 