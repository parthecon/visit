const express = require('express');
const { createEmployee, getEmployees, getEmployee, updateEmployee, deleteEmployee } = require('../controllers/employee');
const router = express.Router();

router.post('/', createEmployee);
router.get('/', getEmployees);
router.get('/:id', getEmployee);
router.put('/:id', updateEmployee);
router.delete('/:id', deleteEmployee);

module.exports = router; 