const express = require('express');
const { getVisitorStats, getCheckinStats } = require('../controllers/analytics');
const router = express.Router();

router.get('/visitors', getVisitorStats);
router.get('/checkins', getCheckinStats);

module.exports = router; 