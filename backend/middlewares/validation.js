const Joi = require('joi');

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const errorDetails = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        status: 'error',
        message: 'Validation error',
        errors: errorDetails
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  register: Joi.object({
    name: Joi.string().required().max(100).trim(),
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(6).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    designation: Joi.string().max(100).optional(), // <-- allow designation
    companyName: Joi.string().required().max(200).trim(),
    companyEmail: Joi.string().email().required().lowercase(),
    companyPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    address: Joi.object({
      street: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      country: Joi.string().required(),
      zipCode: Joi.string().required()
    }).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().required()
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required().lowercase()
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().required().valid(Joi.ref('password'))
  }),

  // User schemas
  createUser: Joi.object({
    name: Joi.string().required().max(100).trim(),
    email: Joi.string().email().required().lowercase(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('company_admin', 'receptionist', 'employee').required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    department: Joi.string().max(100).optional(),
    designation: Joi.string().max(100).optional(),
    employeeId: Joi.string().optional()
  }),

  updateUser: Joi.object({
    name: Joi.string().max(100).trim().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    department: Joi.string().max(100).optional(),
    designation: Joi.string().max(100).optional(),
    employeeId: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    notificationSettings: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      whatsapp: Joi.boolean().optional()
    }).optional()
  }),

  // Visitor schemas
  visitorCheckin: Joi.object({
    name: Joi.string().required().max(100).trim(),
    email: Joi.string().email().required().lowercase(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    hostId: Joi.string().required(),
    purpose: Joi.string().required().max(500),
    visitorType: Joi.string().valid('business', 'personal', 'delivery', 'interview', 'meeting', 'other').optional(),
    companyRepresenting: Joi.string().max(200).optional(),
    vehicleNumber: Joi.string().max(20).optional(),
    expectedDuration: Joi.number().min(15).max(480).optional(),
    emergencyContact: Joi.object({
      name: Joi.string().max(100).optional(),
      phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
      relationship: Joi.string().max(50).optional()
    }).optional(),
    agreements: Joi.object({
      nda: Joi.object({
        accepted: Joi.boolean().required()
      }).optional(),
      termsAndConditions: Joi.object({
        accepted: Joi.boolean().required()
      }).optional()
    }).optional(),
    location: Joi.object({
      building: Joi.string().max(100).optional(),
      floor: Joi.string().max(50).optional(),
      area: Joi.string().max(100).optional()
    }).optional()
  }),

  preRegisterVisitor: Joi.object({
    name: Joi.string().required().max(100).trim(),
    email: Joi.string().email().required().lowercase(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required(),
    purpose: Joi.string().required().max(500),
    visitorType: Joi.string().valid('business', 'personal', 'delivery', 'interview', 'meeting', 'other').optional(),
    companyRepresenting: Joi.string().max(200).optional(),
    scheduledDateTime: Joi.date().iso().required(),
    expectedDuration: Joi.number().min(15).max(480).optional(),
    notes: Joi.string().max(1000).optional()
  }),

  approveVisitor: Joi.object({
    approved: Joi.boolean().required(),
    rejectionReason: Joi.string().max(500).when('approved', {
      is: false,
      then: Joi.required(),
      otherwise: Joi.optional()
    })
  }),

  // Company schemas
  updateCompany: Joi.object({
    name: Joi.string().max(200).trim().optional(),
    email: Joi.string().email().lowercase().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    website: Joi.string().uri().optional(),
    industry: Joi.string().max(100).optional(),
    size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+').optional(),
    address: Joi.object({
      street: Joi.string().optional(),
      city: Joi.string().optional(),
      state: Joi.string().optional(),
      country: Joi.string().optional(),
      zipCode: Joi.string().optional()
    }).optional()
  }),

  updateCompanySettings: Joi.object({
    workingHours: Joi.object().pattern(
      Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      Joi.object({
        start: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        end: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        isWorkingDay: Joi.boolean().optional()
      })
    ).optional(),
    timezone: Joi.string().optional(),
    kioskMode: Joi.boolean().optional(),
    requireNDA: Joi.boolean().optional(),
    requireID: Joi.boolean().optional(),
    requirePhoto: Joi.boolean().optional(),
    requireSignature: Joi.boolean().optional(),
    autoApproval: Joi.boolean().optional(),
    printBadge: Joi.boolean().optional()
  }),

  // Subscription plan schemas
  createPlan: Joi.object({
    name: Joi.string().required().max(100).trim(),
    description: Joi.string().required().max(500),
    price: Joi.object({
      monthly: Joi.number().min(0).required(),
      yearly: Joi.number().min(0).required()
    }).required(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD').optional(),
    limits: Joi.object({
      monthlyVisitors: Joi.number().min(1).required(),
      employees: Joi.number().min(1).required(),
      locations: Joi.number().min(1).required(),
      storage: Joi.number().min(100).required(),
      apiCalls: Joi.number().min(100).optional()
    }).required(),
    planType: Joi.string().valid('free', 'starter', 'professional', 'enterprise', 'custom').required(),
    trialDays: Joi.number().min(0).optional()
  })
};

module.exports = {
  validate,
  schemas
};