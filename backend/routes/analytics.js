const express = require('express');
const { getVisitorStats, getCheckinStats, getTopHosts, getRecentActivity } = require('../controllers/analytics');
const router = express.Router();

router.get('/visitors', getVisitorStats);
router.get('/checkins', getCheckinStats);
router.get('/top-hosts', getTopHosts);
router.get('/recent-activity', getRecentActivity);

module.exports = router; 