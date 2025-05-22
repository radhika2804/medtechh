// Healthcare Scheduling System - Greedy Scheduling Algorithm Visualizer

// Constants for priority scores
const PRIORITY_SCORES = {
  'emergency': 100,
  'high': 50,
  'normal': 25,
  'low': 10
};

// Main scheduler class
class Scheduler {
  constructor() {
    this.doctorAvailability = {}; // Doctor availability by ID
    this.patients = []; // Patients to be scheduled
    this.scheduledAppointments = []; // Successfully scheduled appointments
    this.failedSchedulings = []; // Failed scheduling attempts
  }

  // Set doctor availability
  setDoctorAvailability(doctorId, availableSlots) {
    this.doctorAvailability[doctorId] = availableSlots;
  }

  // Add patient to be scheduled
  addPatient(patient) {
    this.patients.push(patient);
  }

  // Clear all data
  clear() {
    this.doctorAvailability = {};
    this.patients = [];
    this.scheduledAppointments = [];
    this.failedSchedulings = [];
  }

  // Sort patients by priority (emergency > high > normal > low)
  sortPatientsByPriority() {
    this.patients.sort((a, b) => {
      // First sort by priority score (higher is more important)
      const priorityScoreDiff = PRIORITY_SCORES[b.priority] - PRIORITY_SCORES[a.priority];
      
      if (priorityScoreDiff !== 0) return priorityScoreDiff;
      
      // If priority is the same, use registration date
      return new Date(a.registrationDate) - new Date(b.registrationDate);
    });
  }

  // Check if a slot is available for a doctor
  isSlotAvailable(doctorId, date, startTime) {
    // Get doctor's available slots for the specified date
    const slots = this.doctorAvailability[doctorId]?.filter(slot => 
      slot.date === date && slot.available
    );
    
    if (!slots || slots.length === 0) return false;
    
    // Check if the requested start time matches any available slot
    return slots.some(slot => slot.startTime === startTime);
  }

  // Mark a slot as booked
  markSlotAsBooked(doctorId, date, startTime) {
    if (!this.doctorAvailability[doctorId]) return false;
    
    // Find the slot
    const slotIndex = this.doctorAvailability[doctorId].findIndex(slot => 
      slot.date === date && slot.startTime === startTime
    );
    
    if (slotIndex === -1) return false;
    
    // Mark as unavailable
    this.doctorAvailability[doctorId][slotIndex].available = false;
    return true;
  }

  // Run the greedy scheduling algorithm
  runGreedyScheduling() {
    // Step 1: Sort patients by priority
    this.sortPatientsByPriority();
    
    // Step 2: For each patient, find the best available slot
    for (const patient of this.patients) {
      let scheduled = false;
      
      // For each doctor (if patient specifies preferred doctors)
      const doctorIds = patient.preferredDoctorIds || Object.keys(this.doctorAvailability);
      
      for (const doctorId of doctorIds) {
        // Skip if doctor doesn't exist in our system
        if (!this.doctorAvailability[doctorId]) continue;
        
        // Get all available slots for this doctor
        const availableSlots = this.doctorAvailability[doctorId]
          .filter(slot => slot.available)
          .sort((a, b) => {
            // Sort by date, then time
            const dateA = new Date(`${a.date}T${a.startTime}`);
            const dateB = new Date(`${b.date}T${b.startTime}`);
            return dateA - dateB;
          });
        
        // Try to find a suitable slot
        for (const slot of availableSlots) {
          // Check if the slot works for both patient and doctor
          if (this.isSlotAvailable(doctorId, slot.date, slot.startTime)) {
            // Mark the slot as booked
            this.markSlotAsBooked(doctorId, slot.date, slot.startTime);
            
            // Create the appointment
            const appointment = {
              doctorId,
              patientId: patient.id,
              scheduledDate: slot.date,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: 'scheduled',
              reasonForVisit: patient.reasonForVisit,
              priority: patient.priority,
              patientName: patient.name
            };
            
            // Add to scheduled appointments
            this.scheduledAppointments.push(appointment);
            scheduled = true;
            break;
          }
        }
        
        if (scheduled) break;
      }
      
      // If patient couldn't be scheduled
      if (!scheduled) {
        this.failedSchedulings.push({
          patientId: patient.id,
          patientName: patient.name,
          priority: patient.priority,
          reasonForVisit: patient.reasonForVisit
        });
      }
    }
    
    // Return the results
    return {
      scheduledAppointments: this.scheduledAppointments,
      failedSchedulings: this.failedSchedulings
    };
  }

  // Visualize the scheduling process
  visualizeScheduling(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Clear the container
    container.innerHTML = '';
    
    // Create the heading
    const heading = document.createElement('h2');
    heading.textContent = 'Greedy Scheduling Algorithm Visualization';
    container.appendChild(heading);
    
    // Create the patients section
    const patientsSection = document.createElement('div');
    patientsSection.className = 'section';
    
    const patientsHeading = document.createElement('h3');
    patientsHeading.textContent = 'Patients Sorted by Priority';
    patientsSection.appendChild(patientsHeading);
    
    // Create a table for patients
    const patientsTable = document.createElement('table');
    patientsTable.className = 'table';
    
    // Headers
    const patientsHeaders = document.createElement('tr');
    ['Name', 'Priority', 'Reason for Visit', 'Registration Date'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      patientsHeaders.appendChild(th);
    });
    patientsTable.appendChild(patientsHeaders);
    
    // Rows for each patient
    this.patients.forEach(patient => {
      const row = document.createElement('tr');
      row.className = `priority-${patient.priority}`;
      
      const nameCell = document.createElement('td');
      nameCell.textContent = patient.name;
      row.appendChild(nameCell);
      
      const priorityCell = document.createElement('td');
      priorityCell.textContent = utils.priorityToText(patient.priority);
      priorityCell.className = `priority-tag priority-${patient.priority}`;
      row.appendChild(priorityCell);
      
      const reasonCell = document.createElement('td');
      reasonCell.textContent = patient.reasonForVisit;
      row.appendChild(reasonCell);
      
      const dateCell = document.createElement('td');
      dateCell.textContent = utils.formatReadableDate(patient.registrationDate);
      row.appendChild(dateCell);
      
      patientsTable.appendChild(row);
    });
    
    patientsSection.appendChild(patientsTable);
    container.appendChild(patientsSection);
    
    // Create the scheduling results section
    const resultsSection = document.createElement('div');
    resultsSection.className = 'section mt-3';
    
    const resultsHeading = document.createElement('h3');
    resultsHeading.textContent = 'Scheduling Results';
    resultsSection.appendChild(resultsHeading);
    
    // Create a table for scheduled appointments
    const appointmentsTable = document.createElement('table');
    appointmentsTable.className = 'table';
    
    // Headers
    const appointmentsHeaders = document.createElement('tr');
    ['Patient', 'Doctor', 'Date', 'Time', 'Priority', 'Reason'].forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      appointmentsHeaders.appendChild(th);
    });
    appointmentsTable.appendChild(appointmentsHeaders);
    
    // Rows for each scheduled appointment
    this.scheduledAppointments.forEach(appointment => {
      const row = document.createElement('tr');
      row.className = `priority-${appointment.priority}`;
      
      const patientCell = document.createElement('td');
      patientCell.textContent = appointment.patientName;
      row.appendChild(patientCell);
      
      const doctorCell = document.createElement('td');
      doctorCell.textContent = `Dr. ${appointment.doctorId}`; // This will need to be replaced with actual doctor name
      row.appendChild(doctorCell);
      
      const dateCell = document.createElement('td');
      dateCell.textContent = utils.formatReadableDate(appointment.scheduledDate);
      row.appendChild(dateCell);
      
      const timeCell = document.createElement('td');
      timeCell.textContent = `${utils.formatTime(appointment.startTime)} - ${utils.formatTime(appointment.endTime)}`;
      row.appendChild(timeCell);
      
      const priorityCell = document.createElement('td');
      priorityCell.textContent = utils.priorityToText(appointment.priority);
      priorityCell.className = `priority-tag priority-${appointment.priority}`;
      row.appendChild(priorityCell);
      
      const reasonCell = document.createElement('td');
      reasonCell.textContent = appointment.reasonForVisit;
      row.appendChild(reasonCell);
      
      appointmentsTable.appendChild(row);
    });
    
    resultsSection.appendChild(appointmentsTable);
    
    // Show failed schedulings if any
    if (this.failedSchedulings.length > 0) {
      const failedHeading = document.createElement('h3');
      failedHeading.textContent = 'Failed Schedulings';
      failedHeading.className = 'mt-3';
      resultsSection.appendChild(failedHeading);
      
      const failedTable = document.createElement('table');
      failedTable.className = 'table';
      
      // Headers
      const failedHeaders = document.createElement('tr');
      ['Patient', 'Priority', 'Reason for Visit'].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        failedHeaders.appendChild(th);
      });
      failedTable.appendChild(failedHeaders);
      
      // Rows for each failed scheduling
      this.failedSchedulings.forEach(failed => {
        const row = document.createElement('tr');
        row.className = `priority-${failed.priority}`;
        
        const patientCell = document.createElement('td');
        patientCell.textContent = failed.patientName;
        row.appendChild(patientCell);
        
        const priorityCell = document.createElement('td');
        priorityCell.textContent = utils.priorityToText(failed.priority);
        priorityCell.className = `priority-tag priority-${failed.priority}`;
        row.appendChild(priorityCell);
        
        const reasonCell = document.createElement('td');
        reasonCell.textContent = failed.reasonForVisit;
        row.appendChild(reasonCell);
        
        failedTable.appendChild(row);
      });
      
      resultsSection.appendChild(failedTable);
    }
    
    container.appendChild(resultsSection);
  }
}

// Initialize and export the scheduler
window.scheduler = new Scheduler(); 