const express = require('express');
const { 
  getAllTasks, 
  getMyTasks, 
  getPendingTasks, 
  getEmployeeTasks,
  createTask, 
  updateTaskStatus, 
  updateHrNotes, 
  getTaskComments, 
  addComment 
} = require('../controllers/taskController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// All task routes require authentication
router.use(requireAuth);

// HR specific routes
router.get('/', requireRole('hr'), getAllTasks);
router.post('/', requireRole('hr'), createTask);
router.patch('/:id/notes', requireRole('hr'), updateHrNotes);
router.get('/employee/:employeeId', requireRole('hr'), getEmployeeTasks);

// Employee specific routes
router.get('/my-tasks', requireRole('employee'), getMyTasks);
router.get('/pending', requireRole('employee'), getPendingTasks);

// General auth routes (Status and Comments)
router.patch('/:id/status', updateTaskStatus);
router.get('/:id/comments', getTaskComments);
router.post('/:id/comments', addComment);

module.exports = router;
