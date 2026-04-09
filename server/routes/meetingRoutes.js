const express = require('express');
const {
  createMeeting,
  getActiveMeetings,
  endMeeting
} = require('../controllers/meetingController');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const router = express.Router();

// Protect all meeting routes
router.use(requireAuth);

router.get('/active', getActiveMeetings);
router.post('/', requireRole('hr'), createMeeting);
router.patch('/:id/end', requireRole('hr'), endMeeting);

module.exports = router;
