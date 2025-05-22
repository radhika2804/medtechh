const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'doctor', 'patient', 'staff'],
    default: 'patient'
  },
  base64_img: {
    type: String,
    default: null
  },
  // Personal Information
  date_of_birth: {
    type: Date,
    default: null
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
    default: null
  },
  phone: {
    type: String,
    default: null
  },
  address: {
    type: String,
    default: null
  },
  // Emergency Contact
  emergency_contact: {
    name: {
      type: String,
      default: null
    },
    relation: {
      type: String,
      default: null
    },
    phone: {
      type: String,
      default: null
    }
  },
  // Account Settings
  account_status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'active'
  },
  email_verified: {
    type: Boolean,
    default: false
  },
  last_login: {
    type: Date,
    default: null
  },
  login_attempts: {
    type: Number,
    default: 0
  },
  // Password Reset
  reset_password_token: {
    type: String,
    default: null
  },
  reset_password_expires: {
    type: Date,
    default: null
  },
  // Preferences
  notification_preferences: {
    email: {
      type: Boolean,
      default: true
    },
    sms: {
      type: Boolean,
      default: false
    },
    push: {
      type: Boolean,
      default: false
    }
  },
  preferred_language: {
    type: String,
    default: 'English'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  // Security
  two_factor_auth: {
    enabled: {
      type: Boolean,
      default: false
    },
    method: {
      type: String,
      enum: ['none', 'email', 'sms', 'authenticator'],
      default: 'none'
    },
    backup_codes: {
      type: [String],
      default: []
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ 
    id: this._id,
    role: this.role 
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 