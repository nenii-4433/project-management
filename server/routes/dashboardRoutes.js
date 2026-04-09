const express = require('express');
const { 
  getHrStats, 
  getTasksPerEmployee, 
  getTasksCreatedPerMonth, 
  getRecentActivity,
  getEmployeeStats,
  getGlobalActiveTasks
} = require('../controllers/dashboardController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth);

// All HR Dashboard routes require the 'hr' role
router.get('/hr-stats', requireRole('hr'), getHrStats);
router.get('/tasks-per-employee', requireRole('hr'), getTasksPerEmployee);
router.get('/tasks-per-month', requireRole('hr'), getTasksCreatedPerMonth);
router.get('/recent-activity', requireRole('hr'), getRecentActivity);
router.get('/hr-active-tasks', requireRole('hr'), getGlobalActiveTasks);

// Employee Dashboard routes
router.get('/employee-stats', requireRole('employee'), getEmployeeStats);

module.exports = router;
