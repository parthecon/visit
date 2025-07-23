const Company = require('../models/Company');

// Get company by ID
exports.getCompany = async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) {
    return res.status(404).json({ status: 'error', message: 'Company not found' });
  }
  res.json({ status: 'success', data: company });
};

// Flattens nested objects to dot notation for MongoDB updates
function flattenObject(obj, prefix = '', res = {}) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], prefix ? `${prefix}.${key}` : key, res);
    } else {
      res[prefix ? `${prefix}.${key}` : key] = obj[key];
    }
  }
  return res;
}

// Update company by ID
exports.updateCompany = async (req, res) => {
  console.log('UpdateCompany payload:', req.body);
  const update = flattenObject(req.body);
  const company = await Company.findByIdAndUpdate(
    req.params.id,
    { $set: update },
    { new: true, runValidators: true }
  );
  console.log('Updated company:', company);
  if (!company) {
    return res.status(404).json({ status: 'error', message: 'Company not found' });
  }
  res.json({ status: 'success', data: company });
}; 