const mongoose = require('mongoose');

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: String,
    required: [true, 'Please add a specialization'],
    enum: [
      'Cardiology',
      'Dermatology',
      'Endocrinology',
      'Gastroenterology',
      'Neurology',
      'Obstetrics',
      'Oncology',
      'Ophthalmology',
      'Orthopedics',
      'Pediatrics',
      'Psychiatry',
      'Radiology',
      'Surgery',
      'Urology',
      'General Practice',
      'Other'
    ],
    default: 'General Practice'
  },
  qualifications: {
    type: [String],
    default: ['M.D.']
  },
  experience: {
    type: Number,
    default: 0
  },
  licenseNumber: {
    type: String,
    default: function() {
      return `LIC-${Date.now()}`;
    },
    unique: true
  },
  fees: {
    type: Number,
    default: 100
  },
  availableSlots: [{
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    slotDuration: {
      type: Number,  // in minutes
      default: 30
    },
    maxPatients: {
      type: Number,
      default: 1
    }
  }],
  contactInfo: {
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    }
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  reviews: [{
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient'
    },
    text: {
      type: String
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Cascade delete appointments when a doctor is deleted
DoctorSchema.pre('remove', async function(next) {
  await this.model('Appointment').deleteMany({ doctor: this._id });
  next();
});

// Reverse populate with appointments
DoctorSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'doctor',
  justOne: false
});

module.exports = mongoose.model('Doctor', DoctorSchema); 