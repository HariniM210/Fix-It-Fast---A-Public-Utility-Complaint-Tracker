// src/routes/complaints.js
const express = require('express');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const {
  authenticateToken,
  requireAdminOrModerator
} = require('../middleware/auth');
const {
  validateComplaintCreation,
  validateStatusUpdate
} = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/complaints
 * Private - Users see only their complaints; admins/moderators can filter all.
 * Query params:
 *  - page, limit
 *  - status, category, priority, location (search)
 *  - user (admin/moderator only)
 *  - sortBy (default createdAt), sortOrder (asc|desc)
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      location,
      user: userId,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (userId) {
      query.user = userId;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (location) query.location = { $regex: location, $options: 'i' };

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;

    const complaints = await Complaint.find(query)
      .populate('user', 'name email location')
      .populate('assignedTo', 'name email')
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    const total = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get complaints error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints'
    });
  }
});

/**
 * POST /api/complaints
 * Private (Bearer token)
 * Body: { title, description, category, priority, location }
 */
router.post('/', authenticateToken, validateComplaintCreation, async (req, res) => {
  try {
    const { title, description, category, priority, location } = req.body;

    const complaint = new Complaint({
      title,
      description,
      category,
      priority,
      location,
      user: req.user.id
    });

    await complaint.save();

    // Update user's complaints count
    await User.findByIdAndUpdate(req.user.id, { $inc: { complaintsCount: 1 } });

    await complaint.populate('user', 'name email location');

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint
    });
  } catch (error) {
    console.error('Create complaint error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create complaint',
      error: error.message
    });
  }
});

/**
 * GET /api/complaints/:id
 * Private - Users can only see their own complaints
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('user', 'name email location')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.updatedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (req.user.role === 'user' && complaint.user._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    console.error('Get complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch complaint' });
  }
});

/**
 * PUT /api/complaints/:id
 * Private - Only owner or admin; users only if status is 'Pending'
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'user' && complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot update complaint after it has been processed'
      });
    }

    const allowedFields = ['title', 'description', 'category', 'priority', 'location'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('user', 'name email location');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });
  } catch (error) {
    console.error('Update complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint' });
  }
});

/**
 * PUT /api/complaints/:id/status
 * Private (Admin/Moderator)
 * Body: { status: 'Pending' | 'In Progress' | 'Resolved', note? }
 */
router.put('/:id/status', authenticateToken, requireAdminOrModerator, validateStatusUpdate, async (req, res) => {
  try {
    const { status, note } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    if (note) complaint.adminNote = note;

    complaint.statusHistory.push({
      status,
      updatedBy: req.user.id,
      note
    });

    await complaint.save();
    await complaint.populate('user', 'name email location');

    res.json({
      success: true,
      message: 'Complaint status updated successfully',
      complaint
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update complaint status' });
  }
});

/**
 * POST /api/complaints/:id/like
 * Private - toggles like for current user
 */
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    await complaint.toggleLike(req.user.id);

    res.json({
      success: true,
      message: 'Complaint like status updated',
      likes: complaint.likesmongoose 
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: 'Failed to update like status' });
  }
});

/**
 * DELETE /api/complaints/:id
 * Private - only owner or admin; users only if 'Pending'
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    if (complaint.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (req.user.role === 'user' && complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete complaint after it has been processed'
      });
    }

    await Complaint.findByIdAndDelete(req.params.id);

    await User.findByIdAndUpdate(complaint.user, { $inc: { complaintsCount: -1 } });

    res.json({ success: true, message: 'Complaint deleted successfully' });
  } catch (error) {
    console.error('Delete complaint error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete complaint' });
  }
});

/**
 * GET /api/complaints/stats/overview
 * Private (Admin/Moderator)
 */
router.get('/stats/overview', authenticateToken, requireAdminOrModerator, async (req, res) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });

    const byCategory = await Complaint.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const recent = await Complaint.find()
      .populate('user', 'name location')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: { total, pending, inProgress, resolved, byCategory, recent }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
