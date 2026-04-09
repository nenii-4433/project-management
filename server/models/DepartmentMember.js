const mongoose = require('mongoose');

const departmentMemberSchema = new mongoose.Schema({
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

// Unique compound index on departmentId + userId
departmentMemberSchema.index({ departmentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('DepartmentMember', departmentMemberSchema);
