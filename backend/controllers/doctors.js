const Doctor = require('../models/Doctor');
const User = require('../models/User');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res) => {
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
    query = Doctor.find(JSON.parse(queryStr)).populate({
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
    const total = await Doctor.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const doctors = await query;
    
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
      count: doctors.length,
      pagination,
      data: doctors
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res) => {
  try {
    let doctor;
    
    // Special handling for "me" route
    if (req.params.id === 'me') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this route'
        });
      }
      
      if (req.user.role !== 'doctor') {
        return res.status(403).json({
          success: false,
          error: 'User is not a doctor'
        });
      }
      
      doctor = await Doctor.findOne({ user: req.user.id }).populate({
        path: 'user',
        select: 'name email'
      });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found for current user'
        });
      }
    } else {
      doctor = await Doctor.findById(req.params.id).populate({
        path: 'user',
        select: 'name email'
      });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new doctor
// @route   POST /api/doctors
// @access  Private/Admin
exports.createDoctor = async (req, res) => {
  try {
    // Check if user exists
    const user = await User.findById(req.body.user);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Check if doctor profile already exists for this user
    const existingDoctor = await Doctor.findOne({ user: req.body.user });
    
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        error: 'Doctor profile already exists for this user'
      });
    }
    
    // Update user role to doctor
    await User.findByIdAndUpdate(req.body.user, { role: 'doctor' });
    
    // Create doctor
    const doctor = await Doctor.create(req.body);
    
    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update doctor
// @route   PUT /api/doctors/:id
// @access  Private/Admin/Doctor
exports.updateDoctor = async (req, res) => {
  try {
    let doctor;
    
    // Special handling for "me" route
    if (req.params.id === 'me') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this route'
        });
      }
      
      if (req.user.role !== 'doctor') {
        return res.status(403).json({
          success: false,
          error: 'User is not a doctor'
        });
      }
      
      doctor = await Doctor.findOne({ user: req.user.id });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found for current user'
        });
      }
    } else {
      doctor = await Doctor.findById(req.params.id);
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
      
      // Make sure user is doctor owner or admin
      if (doctor.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to update this doctor profile'
        });
      }
    }
    
    doctor = await Doctor.findByIdAndUpdate(doctor._id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete doctor
// @route   DELETE /api/doctors/:id
// @access  Private/Admin
exports.deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    // Make sure user is admin
    if (req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete doctor profiles'
      });
    }
    
    await doctor.remove();
    
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

// @desc    Get doctor's available slots
// @route   GET /api/doctors/:id/slots
// @access  Public
exports.getDoctorSlots = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a date'
      });
    }
    
    let doctor;
    
    // Special handling for "me" route
    if (id === 'me') {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized to access this route'
        });
      }
      
      if (req.user.role !== 'doctor') {
        return res.status(403).json({
          success: false,
          error: 'User is not a doctor'
        });
      }
      
      doctor = await Doctor.findOne({ user: req.user.id });
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor profile not found for current user'
        });
      }
    } else {
      doctor = await Doctor.findById(id);
      
      if (!doctor) {
        return res.status(404).json({
          success: false,
          error: 'Doctor not found'
        });
      }
    }
    
    // Get the day of week for the requested date
    const requestedDate = new Date(date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][requestedDate.getDay()];
    
    // Filter the doctor's available slots for the requested day
    const availableSlots = doctor.availableSlots.filter(slot => slot.day === dayOfWeek);
    
    // Get booked appointments for this doctor on the requested date
    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find({
      doctor: id,
      scheduledDate: {
        $gte: new Date(new Date(date).setHours(0, 0, 0)),
        $lt: new Date(new Date(date).setHours(23, 59, 59))
      },
      status: { $nin: ['cancelled', 'no-show'] }
    });
    
    // Process available slots and remove booked ones
    const { findAvailableSlots } = require('../algorithms/greedyScheduling');
    const freeSlots = findAvailableSlots(doctor, requestedDate, appointments);
    
    res.status(200).json({
      success: true,
      count: freeSlots.length,
      data: freeSlots
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 