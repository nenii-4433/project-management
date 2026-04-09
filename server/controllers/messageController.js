const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const ConversationParticipant = require('../models/ConversationParticipant');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Get all conversations for the current user
// @route   GET /api/messages/conversations
const getConversations = async (req, res) => {
  try {
    const participations = await ConversationParticipant.find({ userId: req.user.userId })
      .populate({
        path: 'conversationId',
        populate: {
          path: 'departmentId',
          select: 'name'
        }
      });
    // Fetch all department memberships to easily map them
    const allMemberships = await mongoose.model('DepartmentMember').find().populate('departmentId', 'name');
    const deptMap = {};
    allMemberships.forEach(m => {
      deptMap[m.userId.toString()] = m.departmentId?.name || 'Unassigned';
    });

    const conversations = await Promise.all(participations.map(async (p) => {
      const conv = p.conversationId.toObject();
      
      // Get participants other than current user
      const otherParticipantsRaw = await ConversationParticipant.find({ 
        conversationId: conv._id,
        userId: { $ne: req.user.userId }
      }).populate('userId', 'name avatarUrl role');

      const otherParticipants = otherParticipantsRaw.map(op => {
        const opObj = op.toObject();
        return {
          ...opObj,
          userId: {
            ...opObj.userId,
            departmentName: opObj.userId.role === 'hr' ? 'Human Resources' : (deptMap[opObj.userId._id.toString()] || 'Unassigned')
          }
        };
      });

      // Get latest message
      const latestMessage = await Message.findOne({ conversationId: conv._id })
        .sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: req.user.userId },
        isRead: false
      });

      return {
        ...conv,
        otherParticipants,
        latestMessage,
        unreadCount
      };
    }));

    // Sort by latest message date
    conversations.sort((a, b) => {
      const dateA = a.latestMessage ? new Date(a.latestMessage.createdAt) : new Date(a.createdAt);
      const dateB = b.latestMessage ? new Date(b.latestMessage.createdAt) : new Date(b.createdAt);
      return dateB - dateA;
    });

    res.status(200).json(conversations);
  } catch (error) {
    console.error('FETCH CONVERSATIONS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching conversations' });
  }
};

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/:conversationId
const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }
  try {
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('senderId', 'name avatarUrl');
    
    res.status(200).json(messages);
  } catch (error) {
    console.error('FETCH MESSAGES ERROR:', error);
    res.status(500).json({ message: 'Server error fetching chat history' });
  }
};

// @desc    Send a message
// @route   POST /api/messages
const sendMessage = async (req, res) => {
  const { conversationId, recipientId, body } = req.body;

  try {
    let finalConversationId = conversationId;

    // 1. Handle New Direct Message (Create conversation if it doesn't exist)
    if (!finalConversationId && recipientId) {
      // Check if conversation already exists between these two
      const existing = await ConversationParticipant.aggregate([
        { $match: { userId: { $in: [new mongoose.Types.ObjectId(req.user.userId), new mongoose.Types.ObjectId(recipientId)] } } },
        { $group: { _id: '$conversationId', count: { $sum: 1 } } },
        { $match: { count: 2 } }
      ]);

      if (existing.length > 0) {
        finalConversationId = existing[0]._id;
      } else {
        const newConv = await Conversation.create({ type: 'hr_employee' });
        await ConversationParticipant.create([
          { conversationId: newConv._id, userId: req.user.userId },
          { conversationId: newConv._id, userId: recipientId }
        ]);
        finalConversationId = newConv._id;
      }
    }

    if (!finalConversationId) {
      return res.status(400).json({ message: 'Conversation ID or Recipient ID required' });
    }

    // 2. Save Message
    const message = await Message.create({
      conversationId: finalConversationId,
      senderId: req.user.userId,
      body
    });

    const populatedMessage = await message.populate('senderId', 'name avatarUrl');

    // 3. Emit Socket event to the conversation room
    const io = req.app.get('io');
    if (io) {
      io.to(finalConversationId.toString()).emit('new_message', populatedMessage);
      
      // Also notify participants who aren't in the room right now (Global user rooms)
      const participants = await ConversationParticipant.find({ conversationId: finalConversationId });
      participants.forEach(p => {
        if (p.userId.toString() !== req.user.userId) {
          io.to(p.userId.toString()).emit('message_received', {
            conversationId: finalConversationId,
            message: populatedMessage
          });
        }
      });
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('SEND MESSAGE ERROR:', error);
    res.status(500).json({ message: 'Server error sending message' });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread
const getUnreadCount = async (req, res) => {
  try {
    const participations = await ConversationParticipant.find({ userId: req.user.userId });
    const conversationIds = participations.map(p => p.conversationId);

    const unreadCount = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      senderId: { $ne: req.user.userId },
      isRead: false
    });

    res.status(200).json({ unreadCount });
  } catch (error) {
    console.error('GET UNREAD COUNT ERROR:', error);
    res.status(500).json({ message: 'Server error fetching unread count' });
  }
};

// @desc    Mark messages as read
// @route   PUT /api/messages/:conversationId/read
const markConversationAsRead = async (req, res) => {
  const { conversationId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    return res.status(400).json({ message: 'Invalid conversation ID' });
  }
  try {
    const result = await Message.updateMany(
      { conversationId, senderId: { $ne: req.user.userId }, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: 'Messages marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('MARK MESSAGES AS READ ERROR:', error);
    res.status(500).json({ message: 'Server error marking messages as read' });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  markConversationAsRead
};
