const crypto = require('crypto');
const User = require('../models/User');
const Company = require('../models/Company');
const SubscriptionPlan = require('../models/SubscriptionPlan');

// Register new company with admin user
exports.register = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      companyName, companyEmail, companyPhone, address
    } = req.body;

    // Get default/free plan
    const defaultPlan = await SubscriptionPlan.findOne({ planType: 'free' });
    if (!defaultPlan) {
      return res.status(500).json({
        status: 'error',
        message: 'Default subscription plan not found'
      });
    }

    // Create company
    const company = await Company.create({
      name: companyName,
      email: companyEmail,
      phone: companyPhone,
      address,
      subscription: {
        planId: defaultPlan._id,
        endDate: new Date(Date.now() + defaultPlan.trialDays * 24 * 60 * 60 * 1000)
      }
    });

    // Create admin user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      designation: req.body.designation, // Save designation if provided
      role: 'company_admin',
      companyId: company._id
    });

    const token = user.getSignedJwtToken();

    res.status(201).json({
      status: 'success',
      message: 'Company registered successfully',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        company: {
          id: company._id,
          name: company.name,
          subscription: company.subscription
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password').populate('companyId');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    const token = user.getSignedJwtToken();

    res.json({
      status: 'success',
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          company: user.companyId
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get current logged in user
exports.getMe = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ status: 'error', message: 'Not authorized' });
  }
  res.json({
    status: 'success',
    data: {
      user: req.user,
      company: req.company
    }
  });
};

// Logout user
exports.logout = (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'No user found with this email'
      });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    
    res.json({
      status: 'success',
      message: 'Password reset email sent'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.body.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid or expired token'
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      status: 'success',
      data: { token }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update password
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        status: 'error',
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    const token = user.getSignedJwtToken();

    res.json({
      status: 'success',
      data: { token }
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};