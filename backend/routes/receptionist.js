// All receptionist routes must be accessed via /api/v1/receptionist (proxied to backend:5000)
// Do NOT call http://localhost:8080/api/v1/receptionist directly from frontend
const express = require('express');
const { createReceptionist, getReceptionists, getReceptionist, updateReceptionist, deleteReceptionist } = require('../controllers/receptionist');
const { protect, authorize } = require('../middlewares/auth');
const router = express.Router();

router.post('/', protect, authorize('company_admin', 'superadmin'), createReceptionist);
router.get('/', protect, authorize('company_admin', 'superadmin'), getReceptionists);
router.get('/:id', protect, authorize('company_admin', 'superadmin'), getReceptionist);
router.put('/:id', protect, authorize('company_admin', 'superadmin'), updateReceptionist);
router.delete('/:id', protect, authorize('company_admin', 'superadmin'), deleteReceptionist);

module.exports = router; 