const express = require('express');
const {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientMedicalHistory
} = require('../controllers/patients');

const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

router
  .route('/')
  .get(protect, authorize('admin', 'doctor'), getPatients)
  .post(protect, createPatient);

router
  .route('/:id')
  .get(protect, getPatient)
  .put(protect, updatePatient)
  .delete(protect, authorize('admin'), deletePatient);

router.get('/:id/medical-history', protect, getPatientMedicalHistory);

module.exports = router; 