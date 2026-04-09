const express = require('express');
const { submitReport, getAllReports, getMyReports } = require('../controllers/reportController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth);

// POST progress report (Only employees can log daily progress)
router.post('/', requireRole('employee'), submitReport);

// GET all reports (Global oversight for HR)
router.get('/', requireRole('hr'), getAllReports);

// GET my reports (Employee history)
router.get('/my-reports', requireRole('employee'), getMyReports);

module.exports = router;
