const express = require('express');
const {
  getAllDepartments,
  createDepartment,
  deleteDepartment,
  getDepartmentMembers,
  addMember,
  removeMember,
} = require('../controllers/departmentController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// All department routes are HR-only
router.use(requireAuth);
router.use(requireRole('hr'));

// GET /api/departments
router.get('/', getAllDepartments);

// POST /api/departments
router.post('/', createDepartment);

// DELETE /api/departments/:id
router.delete('/:id', deleteDepartment);

// GET /api/departments/:id/members
router.get('/:id/members', getDepartmentMembers);

// POST /api/departments/:id/members (userId in body)
router.post('/:id/members', addMember);

// DELETE /api/departments/:id/members/:userId
router.delete('/:id/members/:userId', removeMember);

module.exports = router;
