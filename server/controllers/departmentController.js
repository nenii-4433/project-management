const Department = require('../models/Department');
const DepartmentMember = require('../models/DepartmentMember');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all departments with member count
// @route   GET /api/departments
const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('createdByHrId', 'name')
      .sort({ createdAt: -1 });

    const departmentsWithCounts = await Promise.all(
      departments.map(async (dept) => {
        const memberCount = await DepartmentMember.countDocuments({
          departmentId: dept._id,
        });
        return {
          ...dept.toObject(),
          memberCount,
        };
      })
    );

    res.status(200).json(departmentsWithCounts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new department
// @route   POST /api/departments
const createDepartment = async (req, res) => {
  const { name, description } = req.body;

  try {
    const department = new Department({
      name,
      description,
      createdByHrId: req.user.userId,
    });

    const savedDepartment = await department.save();

    // Log Activity
    try {
      await ActivityLog.create({
        actorId: req.user.userId,
        targetId: savedDepartment._id,
        targetType: 'department',
        action: 'department.created',
        metadata: { departmentName: name },
      });
    } catch (logError) {
      console.error('Activity log failed:', logError);
    }

    res.status(201).json(savedDepartment);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Department name already exists' });
    }
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// @desc    Delete a department and its members
// @route   DELETE /api/departments/:id
const deleteDepartment = async (req, res) => {
  const { id } = req.params;

  try {
    const department = await Department.findByIdAndDelete(id);

    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }

    // Delete members
    await DepartmentMember.deleteMany({ departmentId: id });

    // Log Activity
    try {
      await ActivityLog.create({
        actorId: req.user.userId,
        targetId: id,
        targetType: 'department',
        action: 'department.deleted',
        metadata: { departmentName: department.name },
      });
    } catch (logError) {
      console.error('Activity log failed:', logError);
    }

    res.status(200).json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all members of a department
// @route   GET /api/departments/:id/members
const getDepartmentMembers = async (req, res) => {
  const { id } = req.params;

  try {
    const members = await DepartmentMember.find({ departmentId: id })
      .populate('userId', 'name email avatarUrl')
      .sort({ createdAt: -1 });

    res.status(200).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add a member to a department
// @route   POST /api/departments/:id/members
const addMember = async (req, res) => {
  const { id } = req.params; // departmentId
  const { userId } = req.body;

  try {
    const existingMember = await DepartmentMember.findOne({
      departmentId: id,
      userId,
    });

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this department' });
    }

    const member = new DepartmentMember({
      departmentId: id,
      userId,
    });

    await member.save();

    // Log Activity
    try {
      await ActivityLog.create({
        actorId: req.user.userId,
        targetId: id,
        targetType: 'department',
        action: 'member.added',
        metadata: { departmentId: id, userId },
      });
    } catch (logError) {
      console.error('Activity log failed:', logError);
    }

    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove a member from a department
// @route   DELETE /api/departments/:id/members/:userId
const removeMember = async (req, res) => {
  const { id, userId } = req.params;

  try {
    const member = await DepartmentMember.findOneAndDelete({
      departmentId: id,
      userId,
    });

    if (!member) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    // Log Activity
    try {
      await ActivityLog.create({
        actorId: req.user.userId,
        targetId: id,
        targetType: 'department',
        action: 'member.removed',
        metadata: { departmentId: id, userId },
      });
    } catch (logError) {
      console.error('Activity log failed:', logError);
    }

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  deleteDepartment,
  getDepartmentMembers,
  addMember,
  removeMember,
};
