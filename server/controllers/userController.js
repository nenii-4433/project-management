const User = require('../models/User');
const DepartmentMember = require('../models/DepartmentMember');
const bcrypt = require('bcryptjs');

// @desc    Get all active employees
// @route   GET /api/users/employees
const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee', isActive: true })
      .select('-passwordHash')
      .sort({ name: 1 });

    res.status(200).json(employees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user's department
// @route   GET /api/users/me/department
const getMyDepartment = async (req, res) => {
  try {
    const membership = await DepartmentMember.findOne({ userId: req.user.userId })
      .populate('departmentId');
    
    if (!membership) {
      return res.status(200).json(null);
    }

    res.status(200).json(membership.departmentId);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update current user's profile
// @route   PUT /api/users/profile
const updateProfile = async (req, res) => {
  const { name, email, avatarUrl } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl
    });
  } catch (error) {
    console.error('PROFILE UPDATE ERROR:', error);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// @desc    Change current user's password
// @route   PUT /api/users/profile/password
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('PASSWORD CHANGE ERROR:', error);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

module.exports = { 
  getEmployees, 
  getMyDepartment,
  updateProfile,
  changePassword
};
