const Visitor = require('../models/Visitor');
const VisitLog = require('../models/VisitLog');
const mongoose = require('mongoose');

// Get visitor stats: total, by status, by day/week/month
exports.getVisitorStats = async (req, res) => {
  try {
    const { companyId, from, to } = req.query;
    const match = {};
    if (companyId) match.companyId = mongoose.Types.ObjectId(companyId);
    if (from || to) {
      match.createdAt = {};
      if (from) match.createdAt.$gte = new Date(from);
      if (to) match.createdAt.$lte = new Date(to);
    }
    // Aggregate by status
    const statusAgg = await Visitor.aggregate([
      { $match: match },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    // Aggregate by day
    const dayAgg = await Visitor.aggregate([
      { $match: match },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { '_id': 1 } }
    ]);
    // Total visitors
    const total = await Visitor.countDocuments(match);
    res.json({
      status: 'success',
      data: {
        total,
        byStatus: statusAgg,
        byDay: dayAgg
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get check-in stats: check-ins by hour, peak hours, average duration
exports.getCheckinStats = async (req, res) => {
  try {
    const { companyId, from, to } = req.query;
    const match = { action: 'checked_in' };
    if (companyId) match.companyId = mongoose.Types.ObjectId(companyId);
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }
    // Check-ins by hour
    const byHour = await VisitLog.aggregate([
      { $match: match },
      { $group: {
        _id: { $hour: '$timestamp' },
        count: { $sum: 1 }
      } },
      { $sort: { '_id': 1 } }
    ]);
    // Peak hour
    const peakHour = byHour.reduce((max, curr) => curr.count > max.count ? curr : max, { count: 0 });
    // Average visit duration (for checked out visits)
    const durationMatch = { ...match, action: 'checked_out' };
    const durations = await VisitLog.aggregate([
      { $match: durationMatch },
      { $group: {
        _id: null,
        avgDuration: { $avg: '$duration' },
        count: { $sum: 1 }
      } }
    ]);
    res.json({
      status: 'success',
      data: {
        byHour,
        peakHour,
        averageDuration: durations[0]?.avgDuration || 0,
        checkedOutCount: durations[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 