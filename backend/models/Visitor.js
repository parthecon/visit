const mongoose = require('mongoose');

const VisitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide visitor name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide visitor email'],
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid phone number']
  },
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  hostId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  receptionistId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  purpose: {
    type: String,
    required: [true, 'Please provide purpose of visit'],
    maxlength: [500, 'Purpose cannot be more than 500 characters']
  },
  visitorType: {
    type: String,
    enum: ['business', 'personal', 'delivery', 'interview', 'meeting', 'other'],
    default: 'business'
  },
  companyRepresenting: {
    type: String,
    maxlength: [200, 'Company name cannot be more than 200 characters']
  },
  vehicleNumber: {
    type: String,
    maxlength: [20, 'Vehicle number cannot be more than 20 characters']
  },
  expectedDuration: {
    type: Number, // in minutes
    min: [15, 'Expected duration must be at least 15 minutes'],
    max: [480, 'Expected duration cannot exceed 8 hours']
  },
  scheduledDateTime: {
    type: Date,
    default: null
  },
  checkInTime: {
    type: Date,
    default: null
  },
  checkOutTime: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['scheduled', 'checked_in', 'approved', 'rejected', 'checked_out', 'no_show'],
    default: 'scheduled'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  },
  rejectionReason: {
    type: String,
    maxlength: [500, 'Rejection reason cannot be more than 500 characters']
  },
  documents: {
    photo: {
      type: String,
      default: null
    },
    idProof: {
      type: String,
      default: null
    },
    signature: {
      type: String,
      default: null
    }
  },
  badge: {
    badgeNumber: {
      type: String,
      unique: true,
      sparse: true
    },
    printed: {
      type: Boolean,
      default: false
    },
    printedAt: {
      type: Date,
      default: null
    }
  },
  agreements: {
    nda: {
      accepted: {
        type: Boolean,
        default: false
      },
      acceptedAt: {
        type: Date,
        default: null
      },
      ipAddress: {
        type: String,
        default: null
      }
    },
    termsAndConditions: {
      accepted: {
        type: Boolean,
        default: false
      },
      acceptedAt: {
        type: Date,
        default: null
      }
    }
  },
  notifications: {
    hostNotified: {
      type: Boolean,
      default: false
    },
    hostNotifiedAt: {
      type: Date,
      default: null
    },
    visitorNotified: {
      type: Boolean,
      default: false
    },
    visitorNotifiedAt: {
      type: Date,
      default: null
    }
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [1000, 'Feedback comment cannot be more than 1000 characters']
    },
    submittedAt: {
      type: Date,
      default: null
    }
  },
  location: {
    building: {
      type: String,
      maxlength: [100, 'Building name cannot be more than 100 characters']
    },
    floor: {
      type: String,
      maxlength: [50, 'Floor cannot be more than 50 characters']
    },
    area: {
      type: String,
      maxlength: [100, 'Area cannot be more than 100 characters']
    }
  },
  emergencyContact: {
    name: {
      type: String,
      maxlength: [100, 'Emergency contact name cannot be more than 100 characters']
    },
    phone: {
      type: String,
      match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid emergency contact phone number']
    },
    relationship: {
      type: String,
      maxlength: [50, 'Relationship cannot be more than 50 characters']
    }
  },
  isPreRegistered: {
    type: Boolean,
    default: false
  },
  preRegisteredBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot be more than 1000 characters']
  }
}, {
  timestamps: true
});

// Indexes for performance
VisitorSchema.index({ companyId: 1, status: 1 });
VisitorSchema.index({ hostId: 1, status: 1 });
VisitorSchema.index({ checkInTime: 1 });
VisitorSchema.index({ scheduledDateTime: 1 });
VisitorSchema.index({ email: 1, phone: 1 });

// Virtual for total visit duration
VisitorSchema.virtual('visitDuration').get(function() {
  if (this.checkInTime && this.checkOutTime) {
    return Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60)); // in minutes
  }
  return null;
});

// Method to generate badge number
VisitorSchema.methods.generateBadgeNumber = function() {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  this.badge.badgeNumber = `V${dateStr}${randomNum}`;
  return this.badge.badgeNumber;
};

// Method to check if visitor is currently inside
VisitorSchema.methods.isCurrentlyInside = function() {
  return this.status === 'checked_in' || this.status === 'approved';
};

// Method to calculate visit duration in minutes
VisitorSchema.methods.getVisitDuration = function() {
  if (this.checkInTime && this.checkOutTime) {
    return Math.round((this.checkOutTime - this.checkInTime) / (1000 * 60));
  }
  return null;
};

// Static method to get today's visitors for a company
VisitorSchema.statics.getTodaysVisitors = function(companyId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return this.find({
    companyId: companyId,
    $or: [
      { checkInTime: { $gte: today, $lt: tomorrow } },
      { scheduledDateTime: { $gte: today, $lt: tomorrow } }
    ]
  });
};

module.exports = mongoose.model('Visitor', VisitorSchema);