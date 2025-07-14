const mongoose = require('mongoose');

const NotificationLogSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Company',
    required: true
  },
  visitorId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Visitor',
    default: null
  },
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    required: [true, 'Please provide notification type'],
    enum: [
      'visitor_checkin',
      'visitor_approved',
      'visitor_rejected',
      'visitor_checkout',
      'host_notification',
      'reminder',
      'subscription_alert',
      'payment_reminder',
      'system_alert'
    ]
  },
  channel: {
    type: String,
    required: [true, 'Please provide notification channel'],
    enum: ['email', 'sms', 'whatsapp', 'push', 'webhook']
  },
  recipient: {
    type: String,
    required: [true, 'Please provide recipient'],
    trim: true
  },
  subject: {
    type: String,
    maxlength: [200, 'Subject cannot be more than 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Please provide message'],
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  templateId: {
    type: String,
    default: null
  },
  templateData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed', 'bounced'],
    default: 'pending'
  },
  provider: {
    type: String,
    enum: ['twilio', 'sendgrid', 'mailgun', 'whatsapp_business', 'smtp', 'webhook'],
    default: null
  },
  providerId: {
    type: String,
    default: null
  },
  providerResponse: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  errorMessage: {
    type: String,
    default: null
  },
  retryCount: {
    type: Number,
    default: 0,
    max: [3, 'Maximum retry count is 3']
  },
  scheduledAt: {
    type: Date,
    default: Date.now
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
NotificationLogSchema.index({ companyId: 1, type: 1 });
NotificationLogSchema.index({ status: 1, scheduledAt: 1 });
NotificationLogSchema.index({ channel: 1, provider: 1 });
NotificationLogSchema.index({ createdAt: -1 });

// Method to mark as sent
NotificationLogSchema.methods.markAsSent = function(providerId, providerResponse) {
  this.status = 'sent';
  this.providerId = providerId;
  this.providerResponse = providerResponse;
  this.sentAt = new Date();
  return this.save();
};

// Method to mark as delivered
NotificationLogSchema.methods.markAsDelivered = function() {
  this.status = 'delivered';
  this.deliveredAt = new Date();
  return this.save();
};

// Method to mark as failed
NotificationLogSchema.methods.markAsFailed = function(errorMessage) {
  this.status = 'failed';
  this.errorMessage = errorMessage;
  this.retryCount += 1;
  return this.save();
};

// Method to check if can retry
NotificationLogSchema.methods.canRetry = function() {
  return this.retryCount < 3 && this.status === 'failed';
};

// Static method to get pending notifications
NotificationLogSchema.statics.getPendingNotifications = function(limit = 100) {
  return this.find({
    status: 'pending',
    scheduledAt: { $lte: new Date() }
  })
  .sort({ priority: -1, scheduledAt: 1 })
  .limit(limit);
};

// Static method to get failed notifications that can be retried
NotificationLogSchema.statics.getRetryableNotifications = function(limit = 50) {
  return this.find({
    status: 'failed',
    retryCount: { $lt: 3 },
    scheduledAt: { $lte: new Date() }
  })
  .sort({ priority: -1, scheduledAt: 1 })
  .limit(limit);
};

// Static method to get notification stats
NotificationLogSchema.statics.getStats = function(companyId, dateRange) {
  const matchStage = { companyId: mongoose.Types.ObjectId(companyId) };
  
  if (dateRange) {
    matchStage.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          type: '$type',
          channel: '$channel',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: {
          type: '$_id.type',
          channel: '$_id.channel'
        },
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        total: { $sum: '$count' }
      }
    }
  ]);
};

module.exports = mongoose.model('NotificationLog', NotificationLogSchema);