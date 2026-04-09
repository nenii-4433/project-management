const mongoose = require('mongoose');

const dailyReportSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  progressPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  attachmentUrl: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('DailyReport', dailyReportSchema);
