/**
 * Greedy Algorithm for Healthcare Appointment Scheduling
 * 
 * This algorithm prioritizes appointments based on:
 * 1. Emergency status (highest priority)
 * 2. Patient priority level (high, normal, low)
 * 3. Doctor availability
 * 4. Time constraints
 */

// Function to convert time string to minutes for comparison
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Function to convert minutes back to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Find available slots for a doctor on a specific date
 * @param {Object} doctor - Doctor document
 * @param {Date} date - Date for which to find slots
 * @param {Array} existingAppointments - Already scheduled appointments
 * @returns {Array} - Available time slots
 */
const findAvailableSlots = (doctor, date, existingAppointments) => {
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  
  // Get doctor's availability for this day
  const doctorAvailability = doctor.availableSlots.filter(slot => slot.day === dayOfWeek);
  
  if (doctorAvailability.length === 0) {
    return [];
  }
  
  const availableSlots = [];
  
  // Process each availability block
  doctorAvailability.forEach(availability => {
    const startMinutes = timeToMinutes(availability.startTime);
    const endMinutes = timeToMinutes(availability.endTime);
    const slotDuration = availability.slotDuration || 30; // Default 30 minutes
    
    // Generate all possible slots
    for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
      const slotStartTime = minutesToTime(time);
      
      // Check if slot is already booked
      // Create a new date object to avoid mutating the original date
      const slotDate = new Date(new Date(date).setHours(0, 0, 0, 0));
      const isBooked = existingAppointments.some(appt => {
        const apptDate = new Date(appt.scheduledDate).setHours(0, 0, 0, 0);
        return (
          apptDate === slotDate.getTime() &&
          appt.doctor.toString() === doctor._id.toString() &&
          appt.startTime === slotStartTime &&
          appt.status !== 'cancelled'
        );
      });
      
      // Add slot if not booked
      if (!isBooked) { 
        // Just push the start time as a string
        availableSlots.push(slotStartTime);
      }
    }
  });
  
  return availableSlots;
};

/**
 * Greedy scheduling algorithm
 * @param {Array} patients - Patients needing appointments
 * @param {Array} doctors - Available doctors
 * @param {Date} startDate - Start date for scheduling period
 * @param {Date} endDate - End date for scheduling period
 * @param {Array} existingAppointments - Already scheduled appointments
 * @returns {Array} - Scheduled appointments
 */
const greedyScheduling = async (patients, doctors, startDate, endDate, existingAppointments) => {
  // Sort patients by priority (emergency > high > normal > low)
  const priorityOrder = { 'emergency': 0, 'high': 1, 'normal': 2, 'low': 3 };
  
  const sortedPatients = [...patients].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  
  const scheduledAppointments = [];
  
  // Iterate through sorted patients
  for (const patient of sortedPatients) {
    let appointmentScheduled = false;
    
    // Find matching doctors (specialization for the patient's condition)
    const matchingDoctors = doctors.filter(doctor => {
      // In a real system, you would match based on patient's condition and doctor's specialization
      // For simplicity, we're just using all doctors
      return true;
    });
    
    // Try each date in the period
    const currentDate = new Date(startDate);
    while (currentDate <= endDate && !appointmentScheduled) {
      // For emergency patients, prioritize the current day
      if (patient.priority === 'emergency' && currentDate.getTime() !== new Date(startDate).getTime()) {
        break;
      }
      
      // Try each matching doctor
      for (const doctor of matchingDoctors) {
        const availableSlots = findAvailableSlots(doctor, currentDate, existingAppointments);
        
        if (availableSlots.length > 0) {
          // Take the first available slot (greedy approach)
          const slotTime = availableSlots[0];
          
          // Calculate end time based on doctor's slot duration
          const availabilityForDay = doctor.availableSlots.find(slot => 
            slot.day === ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
          );
          const slotDuration = availabilityForDay.slotDuration || 30;
          
          // Calculate end time
          const [hours, minutes] = slotTime.split(':').map(Number);
          const startTimeInMinutes = hours * 60 + minutes;
          const endTimeInMinutes = startTimeInMinutes + slotDuration;
          const endHours = Math.floor(endTimeInMinutes / 60);
          const endMinutes = endTimeInMinutes % 60;
          const endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
          
          const appointment = {
            doctor: doctor._id,
            patient: patient._id,
            scheduledDate: new Date(currentDate),
            startTime: slotTime,
            endTime: endTime,
            status: 'scheduled',
            priority: patient.priority,
            reasonForVisit: patient.reasonForVisit || 'Regular checkup'
          };
          
          scheduledAppointments.push(appointment);
          existingAppointments.push(appointment); // Update the list of booked appointments
          appointmentScheduled = true;
          break;
        }
      }
      
      // Move to next day if no slot found today
      if (!appointmentScheduled) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    // If still not scheduled and it's an emergency, force an override
    if (!appointmentScheduled && patient.priority === 'emergency') {
      const emergencyDoctor = matchingDoctors[0]; // Take first matching doctor
      if (emergencyDoctor) {
        // Get the doctor's availability for emergency
        const emergencyDate = new Date(startDate);
        const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][emergencyDate.getDay()];
        const doctorAvailability = emergencyDoctor.availableSlots.find(slot => slot.day === dayOfWeek);
        
        let startTime = '12:00'; // Default emergency slot
        let endTime = '12:30';
        
        // Calculate proper end time if we have doctor availability info
        if (doctorAvailability) {
          const slotDuration = doctorAvailability.slotDuration || 30;
          const [hours, minutes] = startTime.split(':').map(Number);
          const startTimeInMinutes = hours * 60 + minutes;
          const endTimeInMinutes = startTimeInMinutes + slotDuration;
          const endHours = Math.floor(endTimeInMinutes / 60);
          const endMinutes = endTimeInMinutes % 60;
          endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
        }
        
        // Create an emergency slot
        const appointment = {
          doctor: emergencyDoctor._id,
          patient: patient._id,
          scheduledDate: emergencyDate,
          startTime: startTime,
          endTime: endTime,
          status: 'scheduled',
          priority: 'emergency',
          reasonForVisit: patient.reasonForVisit || 'Emergency'
        };
        
        scheduledAppointments.push(appointment);
        existingAppointments.push(appointment);
      }
    }
  }
  
  return scheduledAppointments;
};

module.exports = {
  greedyScheduling,
  findAvailableSlots,
  timeToMinutes,
  minutesToTime
}; 