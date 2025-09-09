// src/routes/complaints.js
const express = require('express');
const Complaint = require('../models/Complaint');
const {
  authenticateToken,
  requireAdminOrModerator
} = require('../middleware/auth');
const {
  validateComplaintCreation,
  validateStatusUpdate
} = require('../middleware/validation');
const {
  createComplaint,
  getUserComplaints,
  getComplaint,
  updateComplaintStatus,
  getAllComplaints,
  toggleComplaintLike,
  deleteComplaint
} = require('../controllers/complaintController');

const router = express.Router();

/**
 * GET /api/complaints
 * Private - Get user's complaints or all complaints (admin)
 */
router.get('/', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    return getAllComplaints(req, res);
  } else {
    return getUserComplaints(req, res);
  }
});

/**
 * POST /api/complaints
 * Private (Bearer token)
 */
router.post('/', authenticateToken, validateComplaintCreation, createComplaint);

/**
 * GET /api/complaints/:id
 * Private
 */
router.get('/:id', authenticateToken, getComplaint);

// PUT route for updating complaint details removed - using controller method in DELETE below

/**
 * PUT /api/complaints/:id/status
 * Private (Admin only)
 */
router.put('/:id/status', authenticateToken, updateComplaintStatus);

/**
 * PUT /api/complaints/:id/like
 * Private
 */
router.put('/:id/like', authenticateToken, toggleComplaintLike);

/**
 * DELETE /api/complaints/:id
 * Private
 */
router.delete('/:id', authenticateToken, deleteComplaint);

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

    res.json({ success: true, stats: { total, pending, inProgress, resolved, byCategory, recent } });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
  }
});

module.exports = router;
