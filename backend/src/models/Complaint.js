const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'Roads & Infrastructure',
        'Water Supply',
        'Electricity',
        'Sanitation',
        'Public Transport',
        'Healthcare',
        'Education',
        'Environment',
        'Safety & Security',
        'Other'
      ],
      message: '{VALUE} is not a valid category'
    }
  },
  priority: {
    type: String,
    required: [true, 'Priority is required'],
    enum: {
      values: ['Low', 'Medium', 'High', 'Critical'],
      message: '{VALUE} is not a valid priority level'
    },
    default: 'Medium'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters'],
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
      message: '{VALUE} is not a valid status'
    },
    default: 'Pending'
  },
  adminNote: {
    type: String,
    default: '',
    maxlength: [500, 'Admin note cannot exceed 500 characters']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: ''
    }
  }],
  attachments: [{
    url: String,
    filename: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for likes count
complaintSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Method to toggle like
complaintSchema.methods.toggleLike = async function(userId) {
  const userIndex = this.likes.indexOf(userId);
  if (userIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(userIndex, 1);
  }
  return this.save();
};

// Pre-save middleware to add initial status to history
complaintSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      updatedBy: this.user,
      note: 'Complaint created'
    });
  }
  next();
});

// Index for better performance
complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ category: 1, priority: 1 });
complaintSchema.index({ location: 'text' });

module.exports = mongoose.model('Complaint', complaintSchema);
