const mongoose = require('mongoose');
const Doctor = require('./models/Doctor');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      // First find a user with doctor role
      const doctorUser = await User.findOne({ role: 'doctor' });
      
      if (!doctorUser) {
        console.log('No doctor user found. Creating a test doctor user...');
        
        // Create a test doctor user
        const newUser = await User.create({
          name: 'Test Doctor',
          email: 'testdoctor@example.com',
          password: '$2a$10$cXiMMBTL0DK6EJSrJQ1fQuZZsYgJxOkxiImlO0zD.7BOJtcYQxOTq', // 123456
          role: 'doctor'
        });
        
        // Create a doctor profile
        const newDoctor = await Doctor.create({
          user: newUser._id,
          specialization: 'General Practice',
          qualifications: ['M.D.'],
          experience: 5,
          fees: 150,
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
          ],
          isAvailable: true
        });
        
        console.log('Created new doctor with availability slots:', newDoctor._id);
        process.exit(0);
      }
      
      // Check if doctor already exists for this user
      const existingDoctor = await Doctor.findOne({ user: doctorUser._id });
      
      if (existingDoctor) {
        // Update doctor with availability slots
        existingDoctor.availableSlots = [
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
        ];
        
        await existingDoctor.save();
        console.log('Updated doctor with availability slots:', existingDoctor._id);
      } else {
        // Create a new doctor
        const newDoctor = await Doctor.create({
          user: doctorUser._id,
          specialization: 'General Practice',
          qualifications: ['M.D.'],
          experience: 5,
          fees: 150,
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
          ],
          isAvailable: true
        });
        
        console.log('Created new doctor with availability slots:', newDoctor._id);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error('Error connecting to database:', err);
  }); 