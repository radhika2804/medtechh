const express = require('express');
const {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  autoScheduleAppointments
} = require('../controllers/appointments');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, getAppointments)
  .post(protect, createAppointment);

router
  .route('/:id')
  .get(protect, getAppointment)
  .put(protect, updateAppointment)
  .delete(protect, authorize('admin'), deleteAppointment);

router.post('/auto-schedule', protect, authorize('admin'), autoScheduleAppointments);

module.exports = router; 