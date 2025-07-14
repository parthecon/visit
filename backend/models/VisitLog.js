const mongoose = require('mongoose');

const VisitLogSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Visitor',
    required: true
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
  action: {
    type: String,
    required: [true, 'Please provide action'],
    enum: [
      'pre_registered',
      'checked_in',
      'approved',
      'rejected',
      'checked_out',
      'badge_printed',
      'no_show',
      'cancelled'
    ]
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    ipAddress: {
      type: String,
      default: null
    },
    userAgent: {
      type: String,
      default: null
    },
    device: {
      type: String,
      enum: ['web', 'mobile', 'tablet', 'kiosk'],
      default: 'web'
    },
    building: {
      type: String,
      default: null
    },
    floor: {
      type: String,
      default: null
    },
    area: {
      type: String,
      default: null
    }
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  duration: {
    type: Number, // in minutes
    default: null
  }
}, {
  timestamps: false // Using custom timestamp field
});

// Indexes for performance
VisitLogSchema.index({ visitorId: 1, timestamp: -1 });
VisitLogSchema.index({ companyId: 1, timestamp: -1 });
VisitLogSchema.index({ hostId: 1, timestamp: -1 });
VisitLogSchema.index({ action: 1, timestamp: -1 });

// Method to get visitor timeline
VisitLogSchema.statics.getVisitorTimeline = function(visitorId) {
  return this.find({ visitorId })
    .populate('performedBy', 'name role')
    .sort({ timestamp: 1 });
};

// Method to get company activity logs
VisitLogSchema.statics.getCompanyActivity = function(companyId, options = {}) {
  const query = { companyId };
  
  if (options.dateFrom) {
    query.timestamp = { $gte: new Date(options.dateFrom) };
  }
  
  if (options.dateTo) {
    query.timestamp = query.timestamp || {};
    query.timestamp.$lte = new Date(options.dateTo);
  }
  
  if (options.action) {
    query.action = options.action;
  }
  
  if (options.hostId) {
    query.hostId = options.hostId;
  }

  return this.find(query)
    .populate('visitorId', 'name email phone')
    .populate('hostId', 'name')
    .populate('performedBy', 'name role')
    .sort({ timestamp: -1 })
    .limit(options.limit || 100);
};

// Method to get host activity
VisitLogSchema.statics.getHostActivity = function(hostId, options = {}) {
  const query = { hostId };
  
  if (options.dateFrom) {
    query.timestamp = { $gte: new Date(options.dateFrom) };
  }
  
  if (options.dateTo) {
    query.timestamp = query.timestamp || {};
    query.timestamp.$lte = new Date(options.dateTo);
  }

  return this.find(query)
    .populate('visitorId', 'name email phone')
    .populate('performedBy', 'name role')
    .sort({ timestamp: -1 })
    .limit(options.limit || 50);
};

// Method to calculate visit duration
VisitLogSchema.statics.calculateVisitDuration = async function(visitorId) {
  const logs = await this.find({ visitorId }).sort({ timestamp: 1 });
  
  let checkInTime = null;
  let checkOutTime = null;
  
  for (const log of logs) {
    if (log.action === 'checked_in') {
      checkInTime = log.timestamp;
    } else if (log.action === 'checked_out') {
      checkOutTime = log.timestamp;
    }
  }
  
  if (checkInTime && checkOutTime) {
    return Math.round((checkOutTime - checkInTime) / (1000 * 60)); // in minutes
  }
  
  return null;
};

// Method to get peak hours analytics
VisitLogSchema.statics.getPeakHours = function(companyId, dateRange) {
  const matchStage = {
    companyId: mongoose.Types.ObjectId(companyId),
    action: 'checked_in'
  };
  
  if (dateRange) {
    matchStage.timestamp = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: { $hour: '$timestamp' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

// Method to get daily activity summary
VisitLogSchema.statics.getDailyActivity = function(companyId, dateRange) {
  const matchStage = { companyId: mongoose.Types.ObjectId(companyId) };
  
  if (dateRange) {
    matchStage.timestamp = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          action: '$action'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        actions: {
          $push: {
            action: '$_id.action',
            count: '$count'
          }
        },
        totalActivities: { $sum: '$count' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);
};

module.exports = mongoose.model('VisitLog', VisitLogSchema);