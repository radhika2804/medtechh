const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    default: null
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'],
    default: 'Unknown'
  },
  allergies: [{
    type: String
  }],
  chronicDiseases: [{
    type: String
  }],
  emergencyContact: {
    name: {
      type: String,
      default: ''
    },
    relation: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    }
  },
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
  insuranceInfo: {
    provider: {
      type: String
    },
    policyNumber: {
      type: String
    },
    expiryDate: {
      type: Date
    }
  },
  medicalHistory: [{
    condition: {
      type: String,
      required: true
    },
    diagnosedDate: {
      type: Date
    },
    treatment: {
      type: String
    },
    notes: {
      type: String
    }
  }],
  medications: [{
    name: {
      type: String,
      required: true
    },
    dosage: {
      type: String
    },
    frequency: {
      type: String
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
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

// Calculate age from date of birth
PatientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Cascade delete appointments when a patient is deleted
PatientSchema.pre('remove', async function(next) {
  await this.model('Appointment').deleteMany({ patient: this._id });
  next();
});

// Reverse populate with appointments
PatientSchema.virtual('appointments', {
  ref: 'Appointment',
  localField: '_id',
  foreignField: 'patient',
  justOne: false
});

module.exports = mongoose.model('Patient', PatientSchema); 