const Visitor = require('../models/Visitor');
const VisitLog = require('../models/VisitLog');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper to validate companyId
function getValidCompanyId(companyId) {
  if (!companyId) return null;
  if (!mongoose.Types.ObjectId.isValid(companyId)) return 'invalid';
  return mongoose.Types.ObjectId(companyId);
}

// Get visitor stats: total, by status, by day/week/month
exports.getVisitorStats = async (req, res) => {
  try {
    const { companyId, from, to } = req.query;
    const validCompanyId = getValidCompanyId(companyId);
    if (companyId && validCompanyId === 'invalid') {
      return res.status(400).json({ status: 'error', message: 'Invalid companyId' });
    }
    const match = {};
    if (validCompanyId) match.companyId = validCompanyId;
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
        total: total || 0,
        byStatus: statusAgg || [],
        byDay: dayAgg || []
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
    const validCompanyId = getValidCompanyId(companyId);
    if (companyId && validCompanyId === 'invalid') {
      return res.status(400).json({ status: 'error', message: 'Invalid companyId' });
    }
    const match = { action: 'checked_in' };
    if (validCompanyId) match.companyId = validCompanyId;
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
    const peakHour = byHour.length ? byHour.reduce((max, curr) => curr.count > max.count ? curr : max, { count: 0 }) : { count: 0 };
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
        byHour: byHour || [],
        peakHour: peakHour,
        averageDuration: durations[0]?.avgDuration || 0,
        checkedOutCount: durations[0]?.count || 0
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get top hosts by number of visitors
exports.getTopHosts = async (req, res) => {
  try {
    const { companyId, limit = 5 } = req.query;
    const validCompanyId = getValidCompanyId(companyId);
    if (companyId && validCompanyId === 'invalid') {
      return res.status(400).json({ status: 'error', message: 'Invalid companyId' });
    }
    const match = {};
    if (validCompanyId) match.companyId = validCompanyId;
    // Aggregate visitors by hostId
    const topHostsAgg = await Visitor.aggregate([
      { $match: match },
      { $group: { _id: '$hostId', visitors: { $sum: 1 } } },
      { $sort: { visitors: -1 } },
      { $limit: Number(limit) },
    ]);
    // Populate host names
    const hostIds = topHostsAgg.map(h => h._id);
    const hosts = hostIds.length ? await User.find({ _id: { $in: hostIds } }, 'name') : [];
    const hostMap = {};
    hosts.forEach(h => { hostMap[h._id.toString()] = h.name; });
    // Optionally, calculate avg response time (not implemented here)
    const topHosts = topHostsAgg.map(h => ({
      name: hostMap[h._id.toString()] || 'Unknown',
      visitors: h.visitors,
      avgResponseTime: null // Placeholder
    }));
    res.json({ status: 'success', data: topHosts });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// Get recent activity logs
exports.getRecentActivity = async (req, res) => {
  try {
    const { companyId, limit = 10 } = req.query;
    const validCompanyId = getValidCompanyId(companyId);
    if (companyId && validCompanyId === 'invalid') {
      return res.status(400).json({ status: 'error', message: 'Invalid companyId' });
    }
    const match = {};
    if (validCompanyId) match.companyId = validCompanyId;
    // Get recent VisitLog entries
    const logs = await VisitLog.find(match)
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .populate('visitorId', 'name')
      .populate('hostId', 'name');
    const activity = logs.map(log => ({
      visitor: log.visitorId?.name || 'Unknown',
      host: log.hostId?.name || 'Unknown',
      time: log.timestamp,
      status: log.action
    }));
    res.json({ status: 'success', data: activity });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
}; 