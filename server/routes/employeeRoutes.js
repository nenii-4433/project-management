const express = require('express');
const { 
  getAllEmployees, 
  createEmployee, 
  toggleActiveStatus, 
  deleteEmployee 
} = require('../controllers/employeeController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('hr'));

// GET all employees
router.get('/', getAllEmployees);

// CREATE a new employee
router.post('/', createEmployee);

// TOGGLE active status
router.patch('/:id/toggle-status', toggleActiveStatus);

// DELETE an employee
router.delete('/:id', deleteEmployee);

module.exports = router;
