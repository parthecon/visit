const mongoose = require('mongoose');

const SubscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide plan name'],
    trim: true,
    maxlength: [100, 'Plan name cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide plan description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  price: {
    monthly: {
      type: Number,
      required: [true, 'Please provide monthly price'],
      min: [0, 'Price cannot be negative']
    },
    yearly: {
      type: Number,
      required: [true, 'Please provide yearly price'],
      min: [0, 'Price cannot be negative']
    }
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  limits: {
    monthlyVisitors: {
      type: Number,
      required: [true, 'Please provide monthly visitor limit'],
      min: [1, 'Monthly visitor limit must be at least 1']
    },
    employees: {
      type: Number,
      required: [true, 'Please provide employee limit'],
      min: [1, 'Employee limit must be at least 1']
    },
    locations: {
      type: Number,
      required: [true, 'Please provide location limit'],
      min: [1, 'Location limit must be at least 1']
    },
    storage: {
      type: Number,
      required: [true, 'Please provide storage limit in MB'],
      min: [100, 'Storage limit must be at least 100 MB']
    },
    apiCalls: {
      type: Number,
      default: 10000,
      min: [100, 'API calls limit must be at least 100']
    }
  },
  features: {
    basicCheckin: {
      type: Boolean,
      default: true
    },
    preRegistration: {
      type: Boolean,
      default: true
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      whatsapp: {
        type: Boolean,
        default: false
      }
    },
    badgePrinting: {
      type: Boolean,
      default: false
    },
    analytics: {
      basic: {
        type: Boolean,
        default: true
      },
      advanced: {
        type: Boolean,
        default: false
      },
      customReports: {
        type: Boolean,
        default: false
      }
    },
    integrations: {
      webhooks: {
        type: Boolean,
        default: false
      },
      api: {
        type: Boolean,
        default: false
      },
      sso: {
        type: Boolean,
        default: false
      }
    },
    customization: {
      branding: {
        type: Boolean,
        default: false
      },
      customFields: {
        type: Boolean,
        default: false
      },
      workflows: {
        type: Boolean,
        default: false
      }
    },
    support: {
      level: {
        type: String,
        enum: ['basic', 'priority', 'dedicated'],
        default: 'basic'
      },
      phone: {
        type: Boolean,
        default: false
      },
      chat: {
        type: Boolean,
        default: true
      }
    }
  },
  planType: {
    type: String,
    enum: ['free', 'starter', 'professional', 'enterprise', 'custom'],
    required: true
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },
  trialDays: {
    type: Number,
    default: 14,
    min: [0, 'Trial days cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  stripePriceId: {
    monthly: String,
    yearly: String
  },
  razorpayPlanId: {
    monthly: String,
    yearly: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for performance
SubscriptionPlanSchema.index({ planType: 1, isActive: 1 });
SubscriptionPlanSchema.index({ price: 1 });

// Virtual for monthly savings percentage
SubscriptionPlanSchema.virtual('yearlySavings').get(function() {
  if (this.price.yearly && this.price.monthly) {
    const monthlyTotal = this.price.monthly * 12;
    const savings = monthlyTotal - this.price.yearly;
    return Math.round((savings / monthlyTotal) * 100);
  }
  return 0;
});

// Method to check if a feature is available
SubscriptionPlanSchema.methods.hasFeature = function(featurePath) {
  const keys = featurePath.split('.');
  let current = this.features;
  
  for (const key of keys) {
    if (current[key] === undefined) {
      return false;
    }
    current = current[key];
  }
  
  return current === true;
};

// Method to get feature list
SubscriptionPlanSchema.methods.getFeatureList = function() {
  const features = [];
  
  if (this.features.basicCheckin) features.push('Basic Check-in');
  if (this.features.preRegistration) features.push('Pre-registration');
  if (this.features.notifications.email) features.push('Email Notifications');
  if (this.features.notifications.sms) features.push('SMS Notifications');
  if (this.features.notifications.whatsapp) features.push('WhatsApp Notifications');
  if (this.features.badgePrinting) features.push('Badge Printing');
  if (this.features.analytics.basic) features.push('Basic Analytics');
  if (this.features.analytics.advanced) features.push('Advanced Analytics');
  if (this.features.analytics.customReports) features.push('Custom Reports');
  if (this.features.integrations.webhooks) features.push('Webhooks');
  if (this.features.integrations.api) features.push('API Access');
  if (this.features.integrations.sso) features.push('Single Sign-On');
  if (this.features.customization.branding) features.push('Custom Branding');
  if (this.features.customization.customFields) features.push('Custom Fields');
  if (this.features.customization.workflows) features.push('Custom Workflows');
  
  return features;
};

// Static method to get active public plans
SubscriptionPlanSchema.statics.getActivePlans = function() {
  return this.find({ isActive: true, isPublic: true }).sort({ sortOrder: 1 });
};

module.exports = mongoose.model('SubscriptionPlan', SubscriptionPlanSchema);