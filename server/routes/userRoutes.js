const express = require('express');
const { 
  getEmployees, 
  getMyDepartment, 
  updateProfile, 
  changePassword 
} = require('../controllers/userController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// GET /api/users/employees (Protected, HR Only)
router.get('/employees', requireAuth, requireRole('hr'), getEmployees);

// GET /api/users/me/department (Protected, for Everyone)
router.get('/me/department', requireAuth, getMyDepartment);

// PUT /api/users/profile (Protected, for Everyone)
router.put('/profile', requireAuth, updateProfile);

// PUT /api/users/profile/password (Protected, for Everyone)
router.put('/profile/password', requireAuth, changePassword);

module.exports = router;
