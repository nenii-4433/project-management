const express = require('express');
const { getConversations, getMessages, sendMessage, getUnreadCount, markConversationAsRead } = require('../controllers/messageController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.use(requireAuth);

// GET all conversations for the user
router.get('/conversations', getConversations);

// GET unread message count
router.get('/unread', getUnreadCount);

// GET history of a specific conversation
router.get('/:conversationId', getMessages);

// PUT mark messages as read
router.put('/:conversationId/read', markConversationAsRead);

// POST send a new message
router.post('/', sendMessage);

module.exports = router;
