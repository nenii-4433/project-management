const Notification = require('../models/Notification');

// @desc    Get latest notifications for the current user
// @route   GET /api/notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user.userId })
      .populate('senderId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (error) {
    console.error('FETCH NOTIFICATIONS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipientId: req.user.userId,
      isRead: false
    });

    res.status(200).json(count);
  } catch (error) {
    console.error('UNREAD COUNT ERROR:', error);
    res.status(500).json({ message: 'Server error fetching unread count' });
  }
};

// @desc    Mark a specific notification as read
// @route   PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('MARK AS READ ERROR:', error);
    res.status(500).json({ message: 'Server error marking notification as read' });
  }
};

// @desc    Mark all notifications as read for current user
// @route   PATCH /api/notifications/read-all
const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { recipientId: req.user.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: 'All notifications marked as read', modifiedCount: result.modifiedCount });
  } catch (error) {
    console.error('MARK ALL READ ERROR:', error);
    res.status(500).json({ message: 'Server error marking all as read' });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
