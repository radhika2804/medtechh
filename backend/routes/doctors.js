const express = require('express');
const {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorSlots
} = require('../controllers/doctors');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(getDoctors)
  .post(protect, authorize('admin'), createDoctor);

// Add protected "me" route
router.get('/me', protect, getDoctor);
router.put('/me', protect, updateDoctor);
router.get('/me/slots', protect, getDoctorSlots);

// Parameterized routes go after specific routes
router
  .route('/:id')
  .get(getDoctor)
  .put(protect, authorize('admin', 'doctor'), updateDoctor)
  .delete(protect, authorize('admin'), deleteDoctor);

router.get('/:id/slots', getDoctorSlots);

module.exports = router; 