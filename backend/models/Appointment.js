const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please add an appointment date']
  },
  startTime: {
    type: String,
    required: [true, 'Please add a start time']
  },
  endTime: {
    type: String,
    required: [true, 'Please add an end time']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'scheduled'
  },
  reasonForVisit: {
    type: String,
    required: [true, 'Please add a reason for visit']
  },
  symptoms: [{
    type: String
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'emergency'],
    default: 'normal'
  },
  notes: {
    type: String
  },
  diagnosis: {
    type: String
  },
  prescription: [{
    medication: {
      type: String
    },
    dosage: {
      type: String
    },
    frequency: {
      type: String
    },
    duration: {
      type: String
    },
    specialInstructions: {
      type: String
    }
  }],
  followUpNeeded: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'insurance', 'waived'],
    default: 'pending'
  },
  paymentAmount: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent patient from creating duplicate appointments on the same day and time
AppointmentSchema.index({ doctor: 1, patient: 1, scheduledDate: 1, startTime: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', AppointmentSchema); 