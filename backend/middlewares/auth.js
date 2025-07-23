const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');

// Protect routes - require authentication
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userDoc = await User.findById(decoded.id).select('+password');
    if (!userDoc) {
      return res.status(401).json({ status: 'error', message: 'No user found with this token' });
    }
    if (!userDoc.isActive) {
      return res.status(401).json({ status: 'error', message: 'User account is deactivated' });
    }
    let user = userDoc.toObject ? userDoc.toObject() : userDoc;
    if (user.companyId && typeof user.companyId === 'object' && user.companyId._id) {
      user.companyId = user.companyId._id.toString();
    } else if (user.companyId) {
      user.companyId = user.companyId.toString();
    }
    req.user = user;
    // Attach company if needed
    let companyObj = null;
    if (user.companyId) {
      const company = await Company.findById(user.companyId);
      if (!company || !company.isActive) {
        return res.status(401).json({ status: 'error', message: 'Company account is inactive' });
      }
      if (company.subscription.status !== 'active') {
        return res.status(402).json({ status: 'error', message: 'Company subscription is not active' });
      }
      companyObj = company;
    }
    req.company = companyObj;
    next();
  } catch (error) {
    return res.status(401).json({ status: 'error', message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: `User role ${req.user.role} is not authorized to access this route` });
    }
    next();
  };
};

// Check if user belongs to same company (for company-specific operations)
exports.checkCompanyAccess = async (req, res, next) => {
  try {
    // Super admin can access any company
    if (req.user.role === 'superadmin') {
      return next();
    }

    // For other roles, check company access
    const resourceCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
    
    if (resourceCompanyId && resourceCompanyId !== req.user.companyId.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'Not authorized to access this company\'s resources'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error checking company access'
    });
  }
};

// Optional authentication - don't fail if no token
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (user && user.isActive) {
        req.user = user;
        
        if (user.companyId) {
          const company = await Company.findById(user.companyId);
          if (company && company.isActive) {
            req.company = company;
          }
        }
      }
    } catch (error) {
      // Token is invalid, but we don't fail the request
      console.log('Optional auth failed:', error.message);
    }
  }

  next();
};

// Middleware for API key authentication (for integrations)
exports.apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      status: 'error',
      message: 'API key required'
    });
  }

  try {
    // Find company by API key (you'll need to add apiKey field to Company model)
    const company = await Company.findOne({ 
      'integrations.apiKey': apiKey,
      isActive: true,
      'subscription.status': 'active'
    });

    if (!company) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid API key'
      });
    }

    req.company = company;
    req.isApiKeyAuth = true;
    next();
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error authenticating API key'
    });
  }
};

// Check subscription limits
exports.checkLimits = (limitType) => {
  return async (req, res, next) => {
    try {
      if (req.user.role === 'superadmin') {
        return next();
      }

      const company = req.company;
      if (!company) {
        return res.status(400).json({
          status: 'error',
          message: 'Company information not found'
        });
      }

      let count = 1;
      if (req.body.count) {
        count = parseInt(req.body.count);
      }

      if (!company.isWithinLimits(limitType, count)) {
        const limitNames = {
          visitors: 'monthly visitor',
          employees: 'employee',
          storage: 'storage'
        };

        return res.status(402).json({
          status: 'error',
          message: `${limitNames[limitType === 'visitors' ? 'visitors' : limitType]} limit exceeded. Please upgrade your plan.`,
          limit: company.limits[limitType === 'visitors' ? 'monthlyVisitors' : limitType],
          current: company.usage[limitType === 'visitors' ? 'currentMonthVisitors' : 
                           limitType === 'employees' ? 'totalEmployees' : 'storageUsed']
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Error checking subscription limits'
      });
    }
  };
};