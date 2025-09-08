const mongoose = require('mongoose');

const dashboardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: ['active', 'inactive', 'pending', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'dashboards', // Explicitly set collection name
  timestamps: false // We're handling createdAt manually
});

// Create index on createdAt for sorting
dashboardSchema.index({ createdAt: -1 });

// Create index on status for filtering
dashboardSchema.index({ status: 1 });

module.exports = mongoose.model('Dashboard', dashboardSchema);
