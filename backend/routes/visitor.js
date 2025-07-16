const express = require('express');
const { createVisitor, getVisitors, getVisitor, updateVisitor, deleteVisitor, approveVisitor, rejectVisitor, checkoutVisitor } = require('../controllers/visitor');
const router = express.Router();

router.post('/', createVisitor);
router.get('/', getVisitors);
router.get('/:id', getVisitor);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

// Approve and reject endpoints
router.put('/:id/approve', approveVisitor);
router.put('/:id/reject', rejectVisitor);

router.post('/checkout', checkoutVisitor);

module.exports = router; 