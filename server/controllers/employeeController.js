const User = require('../models/User');
const DepartmentMember = require('../models/DepartmentMember');
const Rating = require('../models/Rating');
const ActivityLog = require('../models/ActivityLog');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// @desc    Get all employees with their department and average rating
// @route   GET /api/employees
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-passwordHash');

    const employeesWithStats = await Promise.all(
      employees.map(async (emp) => {
        // 1. Find department
        const membership = await DepartmentMember.findOne({ userId: emp._id })
          .populate('departmentId', 'name');
        
        // 2. Aggregate average rating
        const ratingStats = await Rating.aggregate([
          { $match: { employeeId: emp._id } },
          { $group: { _id: '$employeeId', avgScore: { $avg: '$score' } } }
        ]);

        return {
          ...emp.toObject(),
          departmentName: membership?.departmentId?.name || 'Unassigned',
          departmentId: membership?.departmentId?._id || null,
          averageRating: ratingStats.length > 0 ? parseFloat(ratingStats[0].avgScore.toFixed(1)) : 0,
        };
      })
    );

    res.status(200).json(employeesWithStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
const createEmployee = async (req, res) => {
  const { name, email, password, departmentId } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      passwordHash,
      role: 'employee',
    });

    const savedUser = await user.save();

    // If departmentId provided, create membership
    if (departmentId) {
      await DepartmentMember.create({
        userId: savedUser._id,
        departmentId,
      });
    }

    // Log Activity
    await ActivityLog.create({
      actorId: req.user.userId,
      targetId: savedUser._id,
      targetType: 'user',
      action: 'employee.added',
      metadata: { employeeName: name },
    });

    const userToReturn = savedUser.toObject();
    delete userToReturn.passwordHash;

    res.status(201).json(userToReturn);
  } catch (error) {
    console.error('EMPLOYEE CREATION CRASH:', error);
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

// @desc    Toggle employee active status
// @route   PATCH /api/employees/:id/toggle-status
const toggleActiveStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Log Activity
    await ActivityLog.create({
      actorId: req.user.userId,
      targetId: id,
      targetType: 'user',
      action: user.isActive ? 'employee.activated' : 'employee.deactivated',
      metadata: { employeeName: user.name },
    });

    const updatedUser = user.toObject();
    delete updatedUser.passwordHash;

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an employee and their memberships
// @route   DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete memberships
    await DepartmentMember.deleteMany({ userId: id });

    // Log Activity
    await ActivityLog.create({
      actorId: req.user.userId,
      targetId: id,
      targetType: 'user',
      action: 'employee.removed',
      metadata: { employeeName: user.name },
    });

    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  toggleActiveStatus,
  deleteEmployee,
};
