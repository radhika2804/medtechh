const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { greedyScheduling } = require('../algorithms/greedyScheduling');

// @desc    Get all appointments
// @route   GET /api/appointments
// @access  Private/Admin
exports.getAppointments = async (req, res) => {
  try {
    // Set up query
    let query;
    
    // For non-admin users, they can only see their own appointments
    if (req.user.role !== 'admin') {
      // For doctors, find appointments where doctor field is linked to this user
      if (req.user.role === 'doctor') {
        const doctor = await Doctor.findOne({ user: req.user.id });
        
        if (!doctor) {
          return res.status(404).json({
            success: false,
            error: 'Doctor profile not found'
          });
        }
        
        query = Appointment.find({ doctor: doctor._id });
      } 
      // For patients, find appointments where patient field is linked to this user
      else if (req.user.role === 'patient') {
        const patient = await Patient.findOne({ user: req.user.id });
        
        if (!patient) {
          return res.status(404).json({
            success: false,
            error: 'Patient profile not found'
          });
        }
        
        query = Appointment.find({ patient: patient._id });
      } else {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view appointments'
        });
      }
    } else {
      // For admin, get all appointments
      query = Appointment.find();
    }
    
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
    
    // Special handling for multiple status[ne] parameters
    // Parse the query string and handle multiple 'ne' values for the same field
    let parsedQuery = JSON.parse(queryStr);
    
    // Convert single $ne to array for $nin if needed
    Object.keys(parsedQuery).forEach(key => {
      // If we have an object with $ne property
      if (parsedQuery[key] && typeof parsedQuery[key] === 'object' && parsedQuery[key].$ne) {
        // If it's already an array, convert to $nin
        if (Array.isArray(parsedQuery[key].$ne)) {
          parsedQuery[key].$nin = parsedQuery[key].$ne;
          delete parsedQuery[key].$ne;
        }
      }
    });
    
    // Finding resource
    query = query.find(parsedQuery)
      .populate({
        path: 'doctor',
        select: 'user specialization fees',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'patient',
        select: 'user dateOfBirth gender contactInfo',
        populate: {
          path: 'user',
          select: 'name email'
        }
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
      query = query.sort('-scheduledDate');
    }
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Appointment.countDocuments();
    
    query = query.skip(startIndex).limit(limit);
    
    // Executing query
    const appointments = await query;
    
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
      count: appointments.length,
      pagination,
      data: appointments
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private/Admin/Owner
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctor',
        select: 'user specialization fees',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .populate({
        path: 'patient',
        select: 'user dateOfBirth gender contactInfo',
        populate: {
          path: 'user',
          select: 'name email'
        }
      });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // Only allow admin, the doctor, or the patient to access the appointment
    if (req.user.role !== 'admin') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      const patient = await Patient.findOne({ user: req.user.id });
      
      if (
        (!doctor || appointment.doctor.toString() !== doctor._id.toString()) &&
        (!patient || appointment.patient.toString() !== patient._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this appointment'
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res) => {
  try {
    const { doctor: doctorId, patient: patientId, scheduledDate, startTime, reasonForVisit } = req.body;
    
    // Check if doctor and patient exist
    const doctor = await Doctor.findById(doctorId);
    const patient = await Patient.findById(patientId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        error: 'Doctor not found'
      });
    }
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: 'Patient not found'
      });
    }
    
    // Only allow patient to book own appointment or admin to book for anyone
    if (req.user.role !== 'admin') {
      const userPatient = await Patient.findOne({ user: req.user.id });
      
      if (!userPatient || userPatient._id.toString() !== patientId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to book appointment for this patient'
        });
      }
    }
    
    // Check if doctor is available at this time
    const appointmentDate = new Date(scheduledDate);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
    
    // Find if doctor has availability on this day
    const doctorAvailability = doctor.availableSlots.find(slot => slot.day === dayOfWeek);
    
    if (!doctorAvailability) {
      return res.status(400).json({
        success: false,
        error: `Doctor is not available on ${dayOfWeek}`
      });
    }
    
    // Check if the time is within doctor's working hours
    if (
      startTime < doctorAvailability.startTime || 
      startTime >= doctorAvailability.endTime
    ) {
      return res.status(400).json({
        success: false,
        error: `Doctor is not available at ${startTime} on ${dayOfWeek}`
      });
    }
    
    // Check if the slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      scheduledDate: {
        $gte: new Date(new Date(scheduledDate).setHours(0, 0, 0)),
        $lt: new Date(new Date(scheduledDate).setHours(23, 59, 59))
      },
      startTime,
      status: { $nin: ['cancelled', 'no-show'] }
    });
    
    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is already booked'
      });
    }
    
    // Calculate end time based on doctor's slot duration
    const slotDuration = doctorAvailability.slotDuration || 30; // Default 30 minutes
    const [hours, minutes] = startTime.split(':').map(Number);
    const startTimeInMinutes = hours * 60 + minutes;
    const endTimeInMinutes = startTimeInMinutes + slotDuration;
    const endHours = Math.floor(endTimeInMinutes / 60);
    const endMinutes = endTimeInMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
    
    // Create appointment
    const appointmentData = {
      doctor: doctorId,
      patient: patientId,
      scheduledDate,
      startTime,
      endTime,
      reasonForVisit,
      status: 'scheduled',
      priority: req.body.priority || 'normal',
      symptoms: req.body.symptoms || [],
      paymentAmount: doctor.fees,
      paymentStatus: 'pending'
    };
    
    const appointment = await Appointment.create(appointmentData);
    
    res.status(201).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
// @access  Private/Admin/Doctor/Patient
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // Check authorization
    if (req.user.role !== 'admin') {
      const doctor = await Doctor.findOne({ user: req.user.id });
      const patient = await Patient.findOne({ user: req.user.id });
      
      if (
        (!doctor || appointment.doctor.toString() !== doctor._id.toString()) &&
        (!patient || appointment.patient.toString() !== patient._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to update this appointment'
        });
      }
      
      // Patients can only update certain fields
      if (patient && appointment.patient.toString() === patient._id.toString()) {
        const allowedFields = ['status']; // Patients can only cancel appointments
        
        for (const key in req.body) {
          if (!allowedFields.includes(key)) {
            delete req.body[key];
          }
        }
        
        // Patients can only cancel appointments, not change to other statuses
        if (req.body.status && req.body.status !== 'cancelled') {
          return res.status(403).json({
            success: false,
            error: 'Patients can only cancel appointments'
          });
        }
      }
    }
    
    // If changing date/time, check availability
    if (req.body.scheduledDate || req.body.startTime) {
      const scheduledDate = req.body.scheduledDate || appointment.scheduledDate;
      const startTime = req.body.startTime || appointment.startTime;
      
      const doctor = await Doctor.findById(appointment.doctor);
      
      const appointmentDate = new Date(scheduledDate);
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][appointmentDate.getDay()];
      
      // Find if doctor has availability on this day
      const doctorAvailability = doctor.availableSlots.find(slot => slot.day === dayOfWeek);
      
      if (!doctorAvailability) {
        return res.status(400).json({
          success: false,
          error: `Doctor is not available on ${dayOfWeek}`
        });
      }
      
      // Check if the time is within doctor's working hours
      if (
        startTime < doctorAvailability.startTime || 
        startTime >= doctorAvailability.endTime
      ) {
        return res.status(400).json({
          success: false,
          error: `Doctor is not available at ${startTime} on ${dayOfWeek}`
        });
      }
      
      // Check if the slot is already booked (excluding this appointment)
      const existingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctor: appointment.doctor,
        scheduledDate: {
          $gte: new Date(new Date(scheduledDate).setHours(0, 0, 0)),
          $lt: new Date(new Date(scheduledDate).setHours(23, 59, 59))
        },
        startTime,
        status: { $nin: ['cancelled', 'no-show'] }
      });
      
      if (existingAppointment) {
        return res.status(400).json({
          success: false,
          error: 'This time slot is already booked'
        });
      }
      
      // Calculate end time based on doctor's slot duration
      if (req.body.startTime) {
        const slotDuration = doctorAvailability.slotDuration || 30; // Default 30 minutes
        const [hours, minutes] = startTime.split(':').map(Number);
        const startTimeInMinutes = hours * 60 + minutes;
        const endTimeInMinutes = startTimeInMinutes + slotDuration;
        const endHours = Math.floor(endTimeInMinutes / 60);
        const endMinutes = endTimeInMinutes % 60;
        const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        
        req.body.endTime = endTime;
      }
    }
    
    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
// @access  Private/Admin
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }
    
    // Only admin can delete appointments
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete appointments'
      });
    }
    
    await appointment.remove();
    
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

// @desc    Auto-schedule appointments using greedy algorithm
// @route   POST /api/appointments/auto-schedule
// @access  Private/Admin
exports.autoScheduleAppointments = async (req, res) => {
  try {
    // Extract data from the request body format the frontend is sending
    const { dateRange, doctorIds, priorities } = req.body;
    
    // Handle dates from the dateRange object
    const startDate = dateRange?.startDate;
    const endDate = dateRange?.endDate;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Please provide start and end dates'
      });
    }
    
    // Fetch doctors - If doctorIds is empty, fetch all available doctors
    let doctors;
    if (!doctorIds || doctorIds.length === 0) {
      // Get all available doctors
      doctors = await Doctor.find({ isAvailable: true });
      console.log(`Using all available doctors: ${doctors.length} found`);
    } else {
      // Get only the specified doctors
      doctors = await Doctor.find({ _id: { $in: doctorIds } });
      console.log(`Using selected doctors: ${doctors.length} found`);
    }
    
    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No doctors found for scheduling'
      });
    }
    
    // Fetch appointments to be rescheduled based on priorities
    // This replaces the previous approach of requiring explicit patient IDs
    let appointmentsQuery = {
      // We'll look at all appointments within the date range that are scheduled or need rescheduling
      scheduledDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      // Only include appointments that are scheduled (not cancelled or completed)
      status: 'scheduled'
    };
    
    // If priorities array is provided, filter by those priorities
    if (priorities && priorities.length > 0) {
      appointmentsQuery.priority = { $in: priorities };
    }
    
    const appointmentsToSchedule = await Appointment.find(appointmentsQuery)
      .populate('patient')
      .populate('doctor')
      .sort({ priority: -1 }); // Sort by priority (emergency first)
    
    if (appointmentsToSchedule.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No appointments found to schedule with the selected priorities'
      });
    }
    
    console.log(`Found ${appointmentsToSchedule.length} appointments to schedule/reschedule`);
    
    // Get existing appointments in the date range that will stay as-is
    // (ones that don't match our priority criteria or are not eligible for rescheduling)
    const existingAppointmentsQuery = {
      scheduledDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      },
      status: { $nin: ['cancelled', 'no-show', 'completed'] }
    };
    
    // Exclude appointments we're going to reschedule
    if (priorities && priorities.length > 0) {
      existingAppointmentsQuery.priority = { $nin: priorities };
    }
    
    const existingAppointments = await Appointment.find(existingAppointmentsQuery);
    
    // Extract patients from appointments to schedule
    const patientsWithPriority = appointmentsToSchedule.map(appointment => {
      return {
        _id: appointment.patient._id,
        priority: appointment.priority || 'normal',
        reasonForVisit: appointment.reasonForVisit || 'Regular checkup',
        appointmentId: appointment._id // Store the appointment ID for updating later
      };
    });
    
    // Run greedy algorithm to schedule appointments
    const scheduledAppointments = await greedyScheduling(
      patientsWithPriority,
      doctors,
      new Date(startDate),
      new Date(endDate),
      existingAppointments
    );
    
    console.log(`Greedy algorithm returned ${scheduledAppointments.length} scheduled appointments`);
    
    // Debug information
    scheduledAppointments.forEach((appt, index) => {
      console.log(`Scheduled appointment ${index + 1}:`, 
        JSON.stringify({
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          date: appt.scheduledDate,
          startTime: appt.startTime
        })
      );
    });
    
    // Update existing appointments instead of creating new ones
    const updatePromises = scheduledAppointments.map(async (appt, index) => {
      try {
        if (!appt.patient) {
          console.log(`Warning: No patient for appointment ${index}`);
          return null;
        }
        
        // Handle different formats of patient ID
        // The greedy algorithm returns with patient as the ID directly
        const patientId = appt.patient || appt.patientId;
        
        if (!patientId) {
          console.log(`Warning: Cannot determine patient ID for appointment ${index}`);
          return null;
        }
        
        const patientIdString = typeof patientId === 'object' 
          ? patientId.toString() 
          : patientId;
        
        // Find the original appointment from our list
        const originalAppointment = appointmentsToSchedule.find(a => {
          if (!a.patient || !a.patient._id) {
            console.log(`Warning: Missing patient or patient._id for appointment in original list`);
            return false;
          }
          
          return a.patient._id.toString() === patientIdString;
        });
        
        if (!originalAppointment) {
          console.log(`Warning: Could not find original appointment for patient ${patientIdString}`);
          return null;
        }
        
        // Handle different formats of doctor ID
        const doctorId = appt.doctor || appt.doctorId;
        
        if (!doctorId) {
          console.log(`Warning: No doctor ID for appointment ${index}`);
          return null;
        }
        
        // Update the appointment with new schedule
        // First check if there's already an appointment with the same doctor, date, and time
        // Format date to YYYY-MM-DD for exact matching
        const apptDate = new Date(appt.scheduledDate);
        const formattedDate = apptDate.toISOString().split('T')[0];
        
        // Find any existing appointments with the same doctor, patient, date, and time
        // Use a more direct approach to avoid any date comparison issues
        const duplicateQuery = {
          _id: { $ne: originalAppointment._id }, // Not the current appointment
          doctor: doctorId,
          startTime: appt.startTime,
          status: { $nin: ['cancelled', 'no-show'] }
        };
        
        // Get all appointments for that doctor and time, then filter for date matches
        const potentialDuplicates = await Appointment.find(duplicateQuery);
        
        // Find any duplicates by checking date equality 
        const duplicates = potentialDuplicates.filter(dup => {
          const dupDate = new Date(dup.scheduledDate);
          const dupFormattedDate = dupDate.toISOString().split('T')[0];
          return dupFormattedDate === formattedDate;
        });
        
        if (duplicates.length > 0) {
          console.log(`Warning: Duplicate appointment(s) found for doctor ${doctorId} on ${formattedDate} at ${appt.startTime}`);
          console.log(`Found ${duplicates.length} potential conflicts`);
          
          // Try to find an alternative time (30 minutes later)
          const [hours, minutes] = appt.startTime.split(':').map(Number);
          const startTimeInMinutes = hours * 60 + minutes;
          
          // Try different time slots with 30-minute increments (up to 3 attempts)
          for (let attempt = 1; attempt <= 3; attempt++) {
            const alternativeTimeInMinutes = startTimeInMinutes + (attempt * 30);
            const alternativeHours = Math.floor(alternativeTimeInMinutes / 60);
            const alternativeMinutes = alternativeTimeInMinutes % 60;
            
            // Skip if we're beyond business hours (e.g., after 5 PM)
            if (alternativeHours >= 17) continue;
            
            const alternativeTime = `${alternativeHours.toString().padStart(2, '0')}:${alternativeMinutes.toString().padStart(2, '0')}`;
            
            // Calculate alternative end time
            const alternativeEndTimeInMinutes = alternativeTimeInMinutes + 30;
            const alternativeEndHours = Math.floor(alternativeEndTimeInMinutes / 60);
            const alternativeEndMinutes = alternativeEndTimeInMinutes % 60;
            const alternativeEndTime = `${alternativeEndHours.toString().padStart(2, '0')}:${alternativeEndMinutes.toString().padStart(2, '0')}`;
            
            // Check if alternative time is available
            const alternativeDuplicateQuery = {
              doctor: doctorId,
              startTime: alternativeTime,
              status: { $nin: ['cancelled', 'no-show'] }
            };
            
            const potentialAltDuplicates = await Appointment.find(alternativeDuplicateQuery);
            
            // Check for date equality
            const altDuplicates = potentialAltDuplicates.filter(dup => {
              const dupDate = new Date(dup.scheduledDate);
              const dupFormattedDate = dupDate.toISOString().split('T')[0];
              return dupFormattedDate === formattedDate;
            });
            
            if (altDuplicates.length === 0) {
              console.log(`Using alternative time ${alternativeTime} instead of ${appt.startTime} (attempt ${attempt})`);
              
              // Alternative time is available, use it
              return Appointment.findByIdAndUpdate(
                originalAppointment._id,
                {
                  scheduledDate: appt.scheduledDate,
                  startTime: alternativeTime,
                  endTime: alternativeEndTime,
                  doctor: doctorId,
                  status: 'scheduled'
                },
                { new: true }
              );
            }
            
            console.log(`Alternative time ${alternativeTime} is also booked. Trying next slot...`);
          }
          
          // All alternative slots are taken, try another day
          const nextDay = new Date(apptDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          console.log(`All slots on ${formattedDate} are booked. Trying next day (${nextDay.toISOString().split('T')[0]})`);
          
          return Appointment.findByIdAndUpdate(
            originalAppointment._id,
            {
              scheduledDate: nextDay,
              startTime: "09:00", // Start with morning slot on next day
              endTime: "09:30",   // 30-minute slot
              doctor: doctorId,
              status: 'scheduled'
            },
            { new: true }
          );
        }
        
        // No duplicates found, proceed with update
        return Appointment.findByIdAndUpdate(
          originalAppointment._id,
          {
            scheduledDate: appt.scheduledDate,
            startTime: appt.startTime,
            endTime: appt.endTime,
            doctor: doctorId,
            status: 'scheduled'
          },
          { new: true }
        );
      } catch (error) {
        console.error(`Error updating appointment ${index}:`, error);
        return null;
      }
    });
    
    // Execute all updates
    const updatedAppointments = await Promise.all(updatePromises);
    const validUpdates = updatedAppointments.filter(Boolean);
    
    res.status(200).json({
      success: true,
      count: validUpdates.length,
      data: validUpdates
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}; 