const User = require('../models/User');
const Department = require('../models/Department');
const Task = require('../models/Task');
const ActivityLog = require('../models/ActivityLog');
const DailyReport = require('../models/DailyReport');

// @desc    Get top-level HR stats
// @route   GET /api/dashboard/hr-stats
const getHrStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalEmployees,
      totalDepartments,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    ] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      Department.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'in_progress' }),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ deadline: { $lt: today }, status: { $ne: 'completed' } })
    ]);

    res.status(200).json({
      totalEmployees,
      totalDepartments,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks
    });
  } catch (error) {
    console.error('HR STATS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching stats' });
  }
};

// @desc    Get tasks count grouped by employee
// @route   GET /api/dashboard/tasks-per-employee
const getTasksPerEmployee = async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$assignedTo',
          taskCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'employee'
        }
      },
      {
        $unwind: '$employee'
      },
      {
        $project: {
          _id: 0,
          employeeName: '$employee.name',
          taskCount: 1
        }
      },
      {
        $sort: { taskCount: -1 }
      }
    ];

    const results = await Task.aggregate(pipeline);
    res.status(200).json(results);
  } catch (error) {
    console.error('TASKS PER EMPLOYEE ERROR:', error);
    res.status(500).json({ message: 'Server error fetching tasks per employee' });
  }
};

// @desc    Get tasks created per month for trailing 6 months
// @route   GET /api/dashboard/tasks-per-month
const getTasksCreatedPerMonth = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ];

    const results = await Task.aggregate(pipeline);

    const formatted = results.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        count: item.count
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.error('TASKS PER MONTH ERROR:', error);
    res.status(500).json({ message: 'Server error fetching tasks per month' });
  }
};

// @desc    Get latest activity feed logs
// @route   GET /api/dashboard/recent-activity
const getRecentActivity = async (req, res) => {
  try {
    const activities = await ActivityLog.find()
      .populate('actorId', 'name avatarUrl')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(activities);
  } catch (error) {
    console.error('RECENT ACTIVITY ERROR:', error);
    res.status(500).json({ message: 'Server error fetching activity feed' });
  }
};

// @desc    Get stats for Employee dashboard
// @route   GET /api/dashboard/employee-stats
const getEmployeeStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [
      pendingTasks,
      acceptedTasks,
      inProgressTasks,
      completedTasks
    ] = await Promise.all([
      Task.countDocuments({ assignedTo: userId, status: 'pending' }),
      Task.countDocuments({ assignedTo: userId, status: 'accepted' }),
      Task.countDocuments({ assignedTo: userId, status: 'in_progress' }),
      Task.countDocuments({ assignedTo: userId, status: 'completed' })
    ]);

    const activeTasksQuery = await Task.find({
      assignedTo: userId,
      status: { $nin: ['completed', 'rejected'] }
    }).sort({ deadline: 1 });

    const activeTasksWithProgress = await Promise.all(activeTasksQuery.map(async (task) => {
      const report = await DailyReport.findOne({ taskId: task._id }).sort({ createdAt: -1 });
      return {
        ...task.toObject(),
        progressPercent: report ? report.progressPercent : 0
      };
    }));

    res.status(200).json({
      stats: {
        pendingTasks,
        acceptedTasks,
        inProgressTasks,
        completedTasks
      },
      activeTasks: activeTasksWithProgress
    });
  } catch (error) {
    console.error('EMPLOYEE DASHBOARD STATS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching employee stats' });
  }
};

// @desc    Get global active tasks for HR
// @route   GET /api/dashboard/hr-active-tasks
const getGlobalActiveTasks = async (req, res) => {
  try {
    const activeTasksQuery = await Task.find({
      status: { $nin: ['completed', 'rejected'] }
    }).sort({ deadline: 1 }).populate('assignedTo', 'name avatarUrl');

    const activeTasksWithProgress = await Promise.all(activeTasksQuery.map(async (task) => {
      const report = await DailyReport.findOne({ taskId: task._id }).sort({ createdAt: -1 });
      return {
        ...task.toObject(),
        progressPercent: report ? report.progressPercent : 0
      };
    }));

    res.status(200).json(activeTasksWithProgress);
  } catch (error) {
    console.error('GLOBAL ACTIVE TASKS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching global active tasks' });
  }
};

module.exports = {
  getHrStats,
  getTasksPerEmployee,
  getTasksCreatedPerMonth,
  getRecentActivity,
  getEmployeeStats,
  getGlobalActiveTasks
};
