const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide company name'],
    trim: true,
    maxlength: [200, 'Company name cannot be more than 200 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide company email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide company phone'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Please provide street address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    country: {
      type: String,
      required: [true, 'Please provide country']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    }
  },
  logo: {
    type: String,
    default: null
  },
  website: {
    type: String,
    match: [
      /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
      'Please provide a valid website URL'
    ]
  },
  industry: {
    type: String,
    maxlength: [100, 'Industry cannot be more than 100 characters']
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '1-10'
  },
  subscription: {
    planId: {
      type: mongoose.Schema.ObjectId,
      ref: 'SubscriptionPlan',
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'suspended', 'cancelled'],
      default: 'active'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    },
    autoRenew: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    workingHours: {
      monday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: true } },
      tuesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: true } },
      wednesday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: true } },
      thursday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: true } },
      friday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: true } },
      saturday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: false } },
      sunday: { start: { type: String, default: '09:00' }, end: { type: String, default: '18:00' }, isWorkingDay: { type: Boolean, default: false } }
    },
    timezone: {
      type: String,
      default: 'UTC'
    },
    kioskMode: {
      type: Boolean,
      default: false
    },
    requireNDA: {
      type: Boolean,
      default: false
    },
    requireID: {
      type: Boolean,
      default: true
    },
    requirePhoto: {
      type: Boolean,
      default: true
    },
    requireSignature: {
      type: Boolean,
      default: false
    },
    autoApproval: {
      type: Boolean,
      default: false
    },
    printBadge: {
      type: Boolean,
      default: true
    }
  },
  limits: {
    monthlyVisitors: {
      type: Number,
      default: 100
    },
    employees: {
      type: Number,
      default: 10
    },
    locations: {
      type: Number,
      default: 1
    },
    storage: {
      type: Number,
      default: 1024 // MB
    }
  },
  usage: {
    currentMonthVisitors: {
      type: Number,
      default: 0
    },
    totalEmployees: {
      type: Number,
      default: 0
    },
    storageUsed: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
CompanySchema.index({ 'subscription.status': 1 });
CompanySchema.index({ 'subscription.endDate': 1 });

// Method to check if company is within limits
CompanySchema.methods.isWithinLimits = function(type, count = 1) {
  switch (type) {
    case 'visitors':
      return this.usage.currentMonthVisitors + count <= this.limits.monthlyVisitors;
    case 'employees':
      return this.usage.totalEmployees + count <= this.limits.employees;
    case 'storage':
      return this.usage.storageUsed + count <= this.limits.storage;
    default:
      return false;
  }
};

// Method to update usage
CompanySchema.methods.updateUsage = function(type, count) {
  switch (type) {
    case 'visitors':
      this.usage.currentMonthVisitors += count;
      break;
    case 'employees':
      this.usage.totalEmployees += count;
      break;
    case 'storage':
      this.usage.storageUsed += count;
      break;
  }
  return this.save();
};

module.exports = mongoose.model('Company', CompanySchema);