const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  targetType: {
    type: String,
    enum: ['task', 'user', 'department', 'report', 'rating'],
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
