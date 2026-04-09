const Rating = require('../models/Rating');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

const giveRating = async (req, res) => {
  const { employeeId, taskId, score, feedback } = req.body;

  if (score < 1 || score > 5) {
    return res.status(400).json({ message: 'Score must be between 1 and 5' });
  }

  try {
    const rating = new Rating({
      employeeId,
      ratedByHrId: req.user.userId,
      taskId: taskId || null,
      score,
      feedback
    });
    await rating.save();

    const notification = await Notification.create({
      recipientId: employeeId,
      type: 'rating_given',
      title: 'You have received a new rating',
      body: `You received a ${score}-star rating. Feedback: ${feedback || 'No feedback provided.'}`,
    });

    await ActivityLog.create({
      actorId: req.user.userId,
      targetId: employeeId,
      targetType: 'rating',
      action: 'rating.given',
      metadata: { score, feedback },
    });

    const io = req.app.get('io');
    if (io) {
      io.to(employeeId.toString()).emit('new_notification', notification);
    }

    res.status(201).json(rating);
  } catch (error) {
    console.error('SERVER ERROR IN giveRating:', error);
    res.status(500).json({ message: 'Server error giving rating' });
  }
};

const getEmployeeRatings = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const ratings = await Rating.find({ employeeId })
      .populate('ratedByHrId', 'name avatarUrl')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(ratings);
  } catch (error) {
    console.error('SERVER ERROR IN getEmployeeRatings:', error);
    res.status(500).json({ message: 'Server error fetching employee ratings' });
  }
};

const getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find()
      .populate('employeeId', 'name avatarUrl')
      .populate('ratedByHrId', 'name avatarUrl')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(ratings);
  } catch (error) {
    console.error('SERVER ERROR IN getAllRatings:', error);
    res.status(500).json({ message: 'Server error fetching all ratings' });
  }
};

module.exports = {
  giveRating,
  getEmployeeRatings,
  getAllRatings
};
