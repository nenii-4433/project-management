const express = require('express');
const { giveRating, getEmployeeRatings, getAllRatings } = require('../controllers/ratingController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

router.use(requireAuth);

router.post('/', requireRole('hr'), giveRating);
router.get('/', requireRole('hr'), getAllRatings);
router.get('/employee/:employeeId', requireAuth, getEmployeeRatings);

module.exports = router;
