const Task = require('../models/Task');
const Notification = require('../models/Notification');
const TaskComment = require('../models/TaskComment');
const ActivityLog = require('../models/ActivityLog');
const DailyReport = require('../models/DailyReport');

// @desc    Get all tasks with filtering and search (HR)
// @route   GET /api/tasks
const getAllTasks = async (req, res) => {
  const { status, priority, search } = req.query;
  const query = {};

  if (status) query.status = status;
  if (priority) query.priority = priority;
  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  try {
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });

    const tasksWithProgress = await Promise.all(
      tasks.map(async (task) => {
        const latestReport = await DailyReport.findOne({ taskId: task._id })
          .sort({ createdAt: -1 });
        return {
          ...task.toObject(),
          latestProgress: latestReport?.progressPercent || 0,
        };
      })
    );

    res.status(200).json(tasksWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current employee's tasks
// @route   GET /api/tasks/my-tasks
const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId })
      .populate('assignedBy', 'name')
      .sort({ createdAt: -1 });

    const tasksWithProgress = await Promise.all(
      tasks.map(async (task) => {
        const latestReport = await DailyReport.findOne({ taskId: task._id })
          .sort({ createdAt: -1 });
        return {
          ...task.toObject(),
          latestProgress: latestReport?.progressPercent || 0,
        };
      })
    );

    res.status(200).json(tasksWithProgress);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current employee's pending tasks
// @route   GET /api/tasks/pending
const getPendingTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user.userId, status: 'pending' })
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all tasks for a specific employee
// @route   GET /api/tasks/employee/:employeeId
const getEmployeeTasks = async (req, res) => {
  const { employeeId } = req.params;
  try {
    const tasks = await Task.find({ assignedTo: employeeId })
      .populate('departmentId', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    console.error('SERVER ERROR IN getEmployeeTasks:', error);
    res.status(500).json({ message: 'Server error fetching tasks' });
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = async (req, res) => {
  const { title, description, assignedTo, departmentId, priority, deadline, hrNotes } = req.body;

  try {
    const task = new Task({
      title,
      description,
      assignedTo,
      assignedBy: req.user.userId,
      departmentId,
      priority,
      deadline,
      hrNotes,
    });

    const savedTask = await task.save();

    // 1. Create Notification
    const notification = await Notification.create({
      recipientId: assignedTo,
      type: 'task_assigned',
      title: 'You have been assigned a new task',
      body: title,
    });

    // 2. Log Activity
    await ActivityLog.create({
      actorId: req.user.userId,
      targetId: savedTask._id,
      targetType: 'task',
      action: 'task.created',
      metadata: { taskTitle: title },
    });

    // 3. Emit Socket Event
    const io = req.app.get('io');
    io.to(assignedTo).emit('new_notification', notification);

    res.status(201).json(savedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    // 1. If employee updates status, notify HR
    if (req.user.role === 'employee') {
      const notification = await Notification.create({
        recipientId: task.assignedBy,
        type: 'task_update',
        title: `Task update: ${task.title}`,
        body: `Status changed from ${oldStatus} to ${status}`,
      });
      
      const io = req.app.get('io');
      io.to(task.assignedBy.toString()).emit('new_notification', notification);
    }

    // 2. Log Activity
    await ActivityLog.create({
      actorId: req.user.userId,
      targetId: id,
      targetType: 'task',
      action: 'task.status_changed',
      metadata: { oldStatus, newStatus: status, taskTitle: task.title },
    });

    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update HR notes
// @route   PATCH /api/tasks/:id/notes
const updateHrNotes = async (req, res) => {
  const { id } = req.params;
  const { hrNotes } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(id, { hrNotes }, { new: true });
    res.status(200).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task comments
// @route   GET /api/tasks/:id/comments
const getTaskComments = async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await TaskComment.find({ taskId: id })
      .populate('authorId', 'name avatarUrl')
      .sort({ createdAt: 1 });

    res.status(200).json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a comment to task
// @route   POST /api/tasks/:id/comments
const addComment = async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  try {
    const comment = await TaskComment.create({
      taskId: id,
      authorId: req.user.userId,
      body,
    });

    const populatedComment = await TaskComment.findById(comment._id)
      .populate('authorId', 'name avatarUrl');

    res.status(201).json(populatedComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllTasks,
  getMyTasks,
  getPendingTasks,
  getEmployeeTasks,
  createTask,
  updateTaskStatus,
  updateHrNotes,
  getTaskComments,
  addComment,
};
