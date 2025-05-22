const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, ...additionalData } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // If the role is doctor, automatically create a doctor profile
    if (role === 'doctor') {
      // Extract doctor-specific fields from additionalData
      const doctorData = {
        user: user._id,
        specialization: additionalData.specialization || 'General Practice',
        qualifications: additionalData.qualifications || ['M.D.'],
        experience: additionalData.experience || 0,
        licenseNumber: additionalData.licenseNumber || `LIC-${Date.now()}`,
        fees: additionalData.fees || 100,
        contactInfo: {
          phone: additionalData.phone || '',
          address: additionalData.address || ''
        },
        // Add default available slots for weekdays
        availableSlots: [
          { 
            day: 'Monday',
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            maxPatients: 1
          },
          {
            day: 'Tuesday',
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            maxPatients: 1
          },
          {
            day: 'Wednesday',
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            maxPatients: 1
          },
          {
            day: 'Thursday',
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            maxPatients: 1
          },
          {
            day: 'Friday',
            startTime: '09:00',
            endTime: '17:00',
            slotDuration: 30,
            maxPatients: 1
          }
        ]
      };

      // Create doctor profile
      await Doctor.create(doctorData);
    } 
    // If the role is patient, automatically create a patient profile
    else if (role === 'patient') {
      // Extract patient-specific fields from additionalData
      const patientInfo = additionalData.patientInfo || {};
      
      const patientData = {
        user: user._id,
        dateOfBirth: patientInfo.dateOfBirth || new Date('1990-01-01'), // Default date
        gender: patientInfo.gender || 'Other',
        bloodGroup: patientInfo.bloodGroup || 'Unknown',
        allergies: patientInfo.allergies || [],
        chronicDiseases: patientInfo.chronicDiseases || [],
        emergencyContact: {
          name: patientInfo.emergencyContact?.name || 'Emergency Contact',
          relation: patientInfo.emergencyContact?.relation || 'Relative',
          phone: patientInfo.emergencyContact?.phone || '000-000-0000'
        },
        contactInfo: {
          phone: patientInfo.contactInfo?.phone || additionalData.phone || '000-000-0000',
          address: patientInfo.contactInfo?.address || additionalData.address || 'No address provided'
        }
      };

      // Create patient profile
      await Patient.create(patientData);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        base64_img: user.base64_img
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, base64_img } = req.body;
    
    // Find the user
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (base64_img) user.base64_img = base64_img;
    
    // Save user
    await user.save();
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        base64_img: user.base64_img
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      base64_img: user.base64_img
    }
  });
}; 