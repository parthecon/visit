const Company = require('../models/Company');

// Get company by ID
exports.getCompany = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return res.status(404).json({ status: 'error', message: 'Company not found' });
  }
  res.json({ status: 'success', data: company });
};

// Update company by ID
exports.updateCompany = async (req, res) => {
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  if (!company) {
    return res.status(404).json({ status: 'error', message: 'Company not found' });
  }
  res.json({ status: 'success', data: company });
}; 