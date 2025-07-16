const express = require('express');
const { updateCompany, getCompany } = require('../controllers/company');
const { protect } = require('../middlewares/auth');
const router = express.Router();

// Get company by ID
router.get('/:id', protect, getCompany);

// Update company by ID
router.put('/:id', protect, updateCompany);

module.exports = router; 