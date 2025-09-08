const express = require('express');
const router = express.Router();
const Dashboard = require('../models/Dashboard');

/**
 * POST /dashboard
 * Create a new dashboard entry
 * Public route - no authentication required for testing
 */
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received dashboard POST request:', req.body);
    
    const { title, description, status } = req.body;

    // Validate required fields
    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
        received: req.body
      });
    }

    // Create new dashboard document
    const newDashboard = new Dashboard({
      title: title.trim(),
      description: description.trim(),
      status: status || 'pending',
      createdAt: new Date()
    });

    console.log('💾 Attempting to save dashboard to MongoDB...');
    const savedDashboard = await newDashboard.save();
    
    console.log('✅ Dashboard saved successfully:', savedDashboard._id);
    console.log('📊 Collection: dashboards');
    console.log('🗄️  Database:', process.env.MONGODB_URI ? 'fixitfast' : 'not configured');

    return res.status(201).json({
      success: true,
      message: 'Dashboard created successfully',
      data: savedDashboard
    });
    
  } catch (error) {
    console.error('❌ Dashboard creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: validationErrors,
        received: req.body
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'Dashboard with this data already exists',
        error: error.message
      });
    }

    // Generic error handler
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});


/**
 * GET /
 * Get all dashboard entries
 * Public route for testing
 */
router.get('/', async (req, res) => {
  try {
    console.log('📥 Getting all dashboard entries...');
    
    const dashboards = await Dashboard.find({})
      .sort({ createdAt: -1 }) // Most recent first
      .limit(50); // Limit to 50 entries
    
    console.log(`✅ Found ${dashboards.length} dashboard entries`);
    
    return res.status(200).json({
      success: true,
      count: dashboards.length,
      data: dashboards
    });
    
  } catch (error) {
    console.error('❌ Dashboard retrieval error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

/**
 * GET /:id
 * Get a specific dashboard entry by ID
 * Public route for testing
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📥 Getting dashboard entry with ID: ${id}`);
    
    const dashboard = await Dashboard.findById(id);
    
    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard entry not found'
      });
    }
    
    console.log('✅ Dashboard entry found');
    
    return res.status(200).json({
      success: true,
      data: dashboard
    });
    
  } catch (error) {
    console.error('❌ Dashboard retrieval error:', error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dashboard ID format'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

module.exports = router;
