const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  // Reference to User model (ObjectId reference)
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true // One profile per user
  },
  
  // Basic profile information
  name: { type: String, required: true },
  bio: { type: String, default: '' },
  location: {
    country: { type: String, default: '' },
    state: { type: String, default: '' },
    city: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  phone: { type: String, default: '' }
}, { timestamps: true });

// Indexes for better query performance
profileSchema.index({ user: 1 }, { unique: true });
profileSchema.index({ 'location.country': 1 });
profileSchema.index({ 'location.state': 1 });
profileSchema.index({ 'location.city': 1 });

// Export the model
module.exports = mongoose.model('Profile', profileSchema);
