const express = require('express');
const { protect } = require('../middlewares/auth');
const { getUserNotifications } = require('../controllers/notification');
const router = express.Router();

router.get('/', protect, getUserNotifications);

module.exports = router; 