const Meeting = require('../models/Meeting');
const DepartmentMember = require('../models/DepartmentMember');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a new meeting
// @route   POST /api/meetings
// @access  Protected (HR only)
const createMeeting = async (req, res) => {
  try {
    const { title, description, departmentId, invitedUsers, roomId } = req.body;
    
    // Authorization check
    if (req.user.role !== 'hr') {
      return res.status(403).json({ message: 'Access denied: Only HR can create meetings' });
    }

    let allInvitees = new Set(invitedUsers || []);

    // If departmentId provided, fetch all members of that department
    if (departmentId) {
      const departmentMembers = await DepartmentMember.find({ departmentId }).select('userId');
      departmentMembers.forEach(member => {
        allInvitees.add(member.userId.toString());
      });
    }

    // Convert Set back to Array for Mongoose
    const inviteesArray = Array.from(allInvitees);

    const newMeeting = await Meeting.create({
      title,
      description,
      hostId: req.user.userId,
      departmentId: departmentId || null,
      invitees: inviteesArray,
      roomId,
    });

    // Notify all invitees
    if (inviteesArray.length > 0) {
      const notifications = inviteesArray.map((id) => ({
        recipientId: id,
        senderId: req.user.userId,
        title: 'New Video Call Invited',
        body: `You are invited to a new meeting: ${title}`,
        type: 'meeting_invitation',
        metadata: {
          meetingId: newMeeting._id,
          roomId: roomId
        }
      }));
      await Notification.insertMany(notifications);

      // Emit socket notification to all invitees
      const io = req.app.get('io');
      inviteesArray.forEach((id) => {
        io.to(id.toString()).emit('new_meeting', {
          meetingId: newMeeting._id,
          title: title,
          roomId: roomId,
          hostName: req.user.name
        });
      });
    }

    res.status(201).json(newMeeting);
  } catch (error) {
    console.error('CREATE MEETING ERROR:', error);
    res.status(500).json({ message: 'Server error creating meeting' });
  }
};

// @desc    Get active meetings for the current user
// @route   GET /api/meetings/active
const getActiveMeetings = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find meetings where host is user OR user is in invitees list
    const meetings = await Meeting.find({
      status: 'active',
      $or: [
        { hostId: userId },
        { invitees: userId }
      ]
    })
    .populate('hostId', 'name avatarUrl')
    .sort({ startTime: -1 });

    res.status(200).json(meetings);
  } catch (error) {
    console.error('FETCH ACTIVE MEETINGS ERROR:', error);
    res.status(500).json({ message: 'Server error fetching active meetings' });
  }
};

// @desc    End a meeting
// @route   PATCH /api/meetings/:id/end
const endMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Only host can end meeting
    if (meeting.hostId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the host can end the meeting' });
    }

    meeting.status = 'ended';
    meeting.endTime = Date.now();
    await meeting.save();

    res.status(200).json({ message: 'Meeting ended successfully', meeting });
  } catch (error) {
    console.error('END MEETING ERROR:', error);
    res.status(500).json({ message: 'Server error ending meeting' });
  }
};

module.exports = {
  createMeeting,
  getActiveMeetings,
  endMeeting
};
