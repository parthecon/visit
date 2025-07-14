const express = require('express');
const { createAdmin, getAdmins, getAdmin, updateAdmin, deleteAdmin } = require('../controllers/admin');
const router = express.Router();

router.post('/', createAdmin);
router.get('/', getAdmins);
router.get('/:id', getAdmin);
router.put('/:id', updateAdmin);
router.delete('/:id', deleteAdmin);

module.exports = router; 