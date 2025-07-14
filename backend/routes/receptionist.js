const express = require('express');
const { createReceptionist, getReceptionists, getReceptionist, updateReceptionist, deleteReceptionist } = require('../controllers/receptionist');
const router = express.Router();

router.post('/', createReceptionist);
router.get('/', getReceptionists);
router.get('/:id', getReceptionist);
router.put('/:id', updateReceptionist);
router.delete('/:id', deleteReceptionist);

module.exports = router; 