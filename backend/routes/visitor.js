const express = require('express');
const { createVisitor, getVisitors, getVisitor, updateVisitor, deleteVisitor } = require('../controllers/visitor');
const router = express.Router();

router.post('/', createVisitor);
router.get('/', getVisitors);
router.get('/:id', getVisitor);
router.put('/:id', updateVisitor);
router.delete('/:id', deleteVisitor);

module.exports = router; 