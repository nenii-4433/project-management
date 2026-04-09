const DailyReport = require('../models/DailyReport');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Submit a work progress report for a task
// @route   POST /api/reports
const submitReport = async (req, res) => {
  const { taskId, description, progressPercent, attachmentUrl } = req.body;

  // Validate progressPercent
  if (progressPercent < 0 || progressPercent > 100) {
    return res.status(400).json({ message: 'Progress percentage must be between 0 and 100' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      console.error(`SUBMIT_REPORT_ERROR: Task ${taskId} not found`);
      return res.status(404).json({ message: 'Task not found' });
    }

    // 1. Create Daily Report
    const report = new DailyReport({
      employeeId: req.user.userId,
      taskId,
      description,
      progressPercent,
      attachmentUrl: attachmentUrl || null
    });
    await report.save();

    // 2. Create Notification for HR
    // Fallback: If for some reason task.assignedBy is missing, find any HR user to notify
    let recipientId = task.assignedBy;
    if (!recipientId) {
      const fallbackHr = await User.findOne({ role: 'hr' });
      recipientId = fallbackHr ? fallbackHr._id : null;
    }

    if (recipientId) {
      const notification = await Notification.create({
        recipientId,
        type: 'report_submitted',
        title: `Progress Update: ${req.user.name}`,
        body: `logged ${progressPercent}% progress on "${task.title}".`,
      });

      // 3. Log Activity
      await ActivityLog.create({
        actorId: req.user.userId,
        targetId: report._id,
        targetType: 'report',
        action: 'report.submitted',
        metadata: { 
          taskTitle: task.title, 
          progress: progressPercent,
          summary: description.substring(0, 50) + '...'
        },
      });

      // 4. Emit socket event
      const io = req.app.get('io');
      if (io) {
        const hrUsers = await User.find({ role: 'hr' }).select('_id');
        hrUsers.forEach(hr => {
          io.to(hr._id.toString()).emit('new_notification', notification);
        });
      }
    }

    res.status(201).json(report);
  } catch (error) {
    console.error('CRITICAL REPORT SUBMISSION ERROR:', error);
    res.status(500).json({ message: `Submission failed: ${error.message}` });
  }
};

// @desc    Get all reports (HR oversight)
// @route   GET /api/reports
const getAllReports = async (req, res) => {
  const { employeeId, taskId } = req.query;
  const filter = {};
  
  if (employeeId) filter.employeeId = employeeId;
  if (taskId) filter.taskId = taskId;

  try {
    const reports = await DailyReport.find(filter)
      .populate('employeeId', 'name avatarUrl')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('FETCH ALL REPORTS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching reports' });
  }
};

// @desc    Get my reports (Employee history)
// @route   GET /api/reports/my-reports
const getMyReports = async (req, res) => {
  try {
    const reports = await DailyReport.find({ employeeId: req.user.userId })
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json(reports);
  } catch (error) {
    console.error('FETCH MY REPORTS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching your reports' });
  }
};

module.exports = {
  submitReport,
  getAllReports,
  getMyReports,
};
