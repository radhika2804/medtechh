const Patient = require('../models/Patient');
const User = require('../models/User');

// @desc    Get all patients
// @route   GET /api/patients
// @access  Private/Admin/Doctor
exports.getPatients = async (req, res) => {
  try {
    // Set up query
    let query;
    
    // Copy req.query
    const reqQuery = { ...req.query };
    
    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];
    
    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
    
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|ne|nin)\b/g, match => `$${match}`);
    
    // Finding resource
    query = Patient.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name email'
    });
    
    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }
    
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Patient.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const patients = await query;
    
    // Pagination result
    const pagination = {};
    
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }
    
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }
    
    res.status(200).json({
      success: true,
      count: patients.length,
      pagination,
      data: patients
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single patient
// @route   GET /api/patients/:id
// @access  Private/Admin/Doctor/Owner
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate({
      path: 'user',
      select: 'name email'
    });
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Make sure user is patient owner, admin, or doctor
    if (
      patient.user.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      req.user.role !== 'doctor'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this patient record'
      });
    }
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new patient
// @route   POST /api/patients
// @access  Private
exports.createPatient = async (req, res) => {
  try {
    // If no user ID is provided, use the authenticated user's ID
    if (!req.body.user) {
      req.body.user = req.user.id;
    } 
    // Admin can create for any user, but regular users can only create for themselves
    else if (req.body.user !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create profile for another user'
      });
    }
    
    // Check if user exists
    const user = await User.findById(req.body.user);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if patient profile already exists for this user
    const existingPatient = await Patient.findOne({ user: req.body.user });
    
    if (existingPatient) {
      return res.status(200).json({
        success: true,
        message: 'Patient profile already exists',
        data: existingPatient
      });
    }
    
    // Update user role to patient if it's not admin or doctor
    if (user.role !== 'admin' && user.role !== 'doctor') {
      await User.findByIdAndUpdate(req.body.user, { role: 'patient' });
    }
    
    // Create patient with minimal required fields
    const patientData = {
      user: req.body.user,
      // Add defaults for required fields
      ...req.body
    };
    
    // Create patient
    const patient = await Patient.create(patientData);
    
    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Patient creation error:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update patient
// @route   PUT /api/patients/:id
// @access  Private/Admin/Owner
exports.updatePatient = async (req, res) => {
  try {
    let patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Make sure user is patient owner or admin
    if (patient.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to update this patient profile'
      });
    }
    
    patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: patient
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete patient
// @route   DELETE /api/patients/:id
// @access  Private/Admin
exports.deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete patient profiles'
      });
    }
    
    await patient.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get patient's medical history
// @route   GET /api/patients/:id/medical-history
// @access  Private/Admin/Doctor/Owner
exports.getPatientMedicalHistory = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Make sure user is patient owner, admin, or doctor
    if (
      patient.user.toString() !== req.user.id && 
      req.user.role !== 'admin' &&
      req.user.role !== 'doctor'
    ) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this patient medical history'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        medicalHistory: patient.medicalHistory,
        medications: patient.medications,
        allergies: patient.allergies,
        chronicDiseases: patient.chronicDiseases
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 