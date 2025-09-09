const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const Dashboard = require('../models/Dashboard');
const User = require('../models/User');

// POST /api/complaints - Create new complaint
const createComplaint = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { title, description, category, priority, location } = req.body;
    const userId = req.user.id;

    // Create new complaint
    const complaint = new Complaint({
      user: userId,
      title: (title || '').trim(),
      description: (description || '').trim(),
      category,
      priority: priority || 'Medium',
      location: (location || '').trim(),
      status: 'Pending'
    });

    await complaint.save();

    // Update user's dashboard
    try {
      let dashboard = await Dashboard.findOne({ user: userId });
      if (!dashboard) {
        // Create dashboard if it doesn't exist
        dashboard = await Dashboard.create({ user: userId });
      }
      await dashboard.incrementComplaint('Pending');
    } catch (dashboardError) {
      console.error('Failed to update dashboard for complaint creation:', dashboardError);
      // Don't fail the complaint creation if dashboard update fails
    }

    // Populate user info for response
    await complaint.populate('user', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint: {
        id: complaint._id,
        title: complaint.title,
        description: complaint.description,
        category: complaint.category,
        priority: complaint.priority,
        location: complaint.location,
        status: complaint.status,
        user: complaint.user,
        createdAt: complaint.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to create complaint' 
    });
  }
};

// GET /api/complaints - Get user's complaints
const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const complaints = await Complaint.find({ user: userId })
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments({ user: userId });

    return res.json({
      success: true,
      complaints,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: complaints.length,
        totalComplaints: total
      }
    });
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch complaints' 
    });
  }
};

// GET /api/complaints/:id - Get specific complaint
const getComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let complaint;
    if (userRole === 'admin') {
      // Admin can see all complaints
      complaint = await Complaint.findById(complaintId)
        .populate('user', 'name email phone location')
        .populate('assignedTo', 'name email')
        .populate('statusHistory.updatedBy', 'name email');
    } else {
      // User can only see their own complaints
      complaint = await Complaint.findOne({ _id: complaintId, user: userId })
        .populate('user', 'name email phone location')
        .populate('assignedTo', 'name email')
        .populate('statusHistory.updatedBy', 'name email');
    }

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found' 
      });
    }

    return res.json({
      success: true,
      complaint
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch complaint' 
    });
  }
};

// PUT /api/complaints/:id/status - Update complaint status (Admin only)
const updateComplaintStatus = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const complaintId = req.params.id;
    const { status, adminNote } = req.body;
    const adminId = req.user.id;

    if (!['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status value' 
      });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found' 
      });
    }

    const oldStatus = complaint.status;
    const newStatus = status;

    // Update complaint
    complaint.status = newStatus;
    complaint.adminNote = adminNote || complaint.adminNote;
    complaint.statusHistory.push({
      status: newStatus,
      updatedBy: adminId,
      note: adminNote || `Status changed from ${oldStatus} to ${newStatus}`
    });

    await complaint.save();

    // Update dashboard counts
    try {
      let dashboard = await Dashboard.findOne({ user: complaint.user });
      if (!dashboard) {
        dashboard = await Dashboard.create({ user: complaint.user });
        await dashboard.incrementComplaint(oldStatus);
      }
      await dashboard.updateComplaintStatus(oldStatus, newStatus);
    } catch (dashboardError) {
      console.error('Failed to update dashboard for status change:', dashboardError);
    }

    await complaint.populate('user', 'name email');
    await complaint.populate('assignedTo', 'name email');

    return res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Error updating complaint status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to update complaint status' 
    });
  }
};

// GET /api/complaints/admin/all - Get all complaints (Admin only)
const getAllComplaints = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. Admin only.' 
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status;
    const category = req.query.category;
    const priority = req.query.priority;

    let filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email phone location')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Complaint.countDocuments(filter);

    return res.json({
      success: true,
      complaints,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: complaints.length,
        totalComplaints: total
      }
    });
  } catch (error) {
    console.error('Error fetching all complaints:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch complaints' 
    });
  }
};

// PUT /api/complaints/:id/like - Toggle like on complaint
const toggleComplaintLike = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found' 
      });
    }

    await complaint.toggleLike(userId);
    await complaint.populate('user', 'name email');

    return res.json({
      success: true,
      message: 'Like toggled successfully',
      complaint,
      likesCount: complaint.likesCount
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to toggle like' 
    });
  }
};

// DELETE /api/complaints/:id - Delete complaint (User can delete their own, Admin can delete any)
const deleteComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    let complaint;
    if (userRole === 'admin') {
      complaint = await Complaint.findById(complaintId);
    } else {
      complaint = await Complaint.findOne({ _id: complaintId, user: userId });
    }

    if (!complaint) {
      return res.status(404).json({ 
        success: false, 
        message: 'Complaint not found or access denied' 
      });
    }

    const complaintUserId = complaint.user;
    const complaintStatus = complaint.status;

    await Complaint.findByIdAndDelete(complaintId);

    // Update dashboard - decrement counts
    try {
      const dashboard = await Dashboard.findOne({ user: complaintUserId });
      if (dashboard) {
        dashboard.totalComplaints = Math.max(0, dashboard.totalComplaints - 1);
        
        switch (complaintStatus.toLowerCase()) {
          case 'pending':
            dashboard.pending = Math.max(0, dashboard.pending - 1);
            break;
          case 'in progress':
            dashboard.inProgress = Math.max(0, dashboard.inProgress - 1);
            break;
          case 'resolved':
            dashboard.resolved = Math.max(0, dashboard.resolved - 1);
            break;
          case 'rejected':
            dashboard.rejected = Math.max(0, dashboard.rejected - 1);
            break;
        }
        
        await dashboard.save();
      }
    } catch (dashboardError) {
      console.error('Failed to update dashboard for complaint deletion:', dashboardError);
    }

    return res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to delete complaint' 
    });
  }
};

module.exports = {
  createComplaint,
  getUserComplaints,
  getComplaint,
  updateComplaintStatus,
  getAllComplaints,
  toggleComplaintLike,
  deleteComplaint
};
