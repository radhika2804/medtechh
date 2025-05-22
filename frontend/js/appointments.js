// Healthcare Scheduling System - Appointments Functionality

// Load appointments data
async function loadAppointments() {
  try {
    // Show appointments content and hide page loading spinner
    document.getElementById('appointments-content').style.display = 'block';
    const pageLoading = document.getElementById('page-loading');
    if (pageLoading) pageLoading.style.display = 'none';
    
    // Setup tab switching
    setupTabs();
    
    // Load doctors for booking
    await loadDoctors();
    
    // Load upcoming appointments
    await loadUpcomingAppointments();
    
    // Load past appointments
    await loadPastAppointments();
  } catch (error) {
    console.error('Error loading appointments data:', error);
    const pageLoading = document.getElementById('page-loading');
    if (pageLoading) {
      pageLoading.innerHTML = `
        <div class="alert alert-danger">
          <p>Error loading appointments data. Please try refreshing the page.</p>
          <p>Details: ${error.message || 'Unknown error'}</p>
        </div>
      `;
    }
  }
}

// Setup tabs functionality
function setupTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Get tab to activate
      const tabId = button.getAttribute('data-tab');
      
      // Deactivate all tabs
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // Activate selected tab
      button.classList.add('active');
      document.getElementById(`${tabId}-tab`).classList.add('active');
    });
  });
  
  // Add event listener to "Book Now" button in no-upcoming section
  const bookNowBtn = document.querySelector('.book-now-btn');
  if (bookNowBtn) {
    bookNowBtn.addEventListener('click', () => {
      tabButtons.forEach(btn => {
        if (btn.getAttribute('data-tab') === 'book') {
          btn.click();
        }
      });
    });
  }
}

// Load doctors for appointment booking
async function loadDoctors() {
  const doctorsList = document.getElementById('doctors-list');
  const loadingDoctors = document.getElementById('loading-doctors');
  const doctorFilter = document.getElementById('doctor-filter');
  
  try {
    // Get all available doctors
    const response = await api.doctors.getAllDoctors('?isAvailable=true');
    
    // Hide loading
    loadingDoctors.style.display = 'none';
    
    if (response.success && response.data.length > 0) {
      // Create doctor cards
      const doctorsGrid = document.createElement('div');
      doctorsGrid.style.display = 'grid';
      doctorsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(250px, 1fr))';
      doctorsGrid.style.gap = '15px';
      
      // Store all doctors for filtering
      window.allDoctors = response.data;
      
      // Render doctor cards
      renderDoctorCards(doctorsGrid, response.data);
      
      // Add to DOM
      doctorsList.innerHTML = '';
      doctorsList.appendChild(doctorsGrid);
      
      // Setup book appointment buttons
      setTimeout(() => {
        setupBookButtons();
      }, 100);
      
      // Setup filter event
      doctorFilter.addEventListener('change', () => {
        const specialization = doctorFilter.value;
        let filteredDoctors = window.allDoctors;
        
        if (specialization) {
          filteredDoctors = window.allDoctors.filter(doctor => 
            doctor.specialization === specialization
          );
        }
        
        // Re-render with filtered doctors
        doctorsGrid.innerHTML = '';
        renderDoctorCards(doctorsGrid, filteredDoctors);
        
        // Re-setup book buttons after filtering
        setTimeout(() => {
          setupBookButtons();
        }, 100);
      });
    } else {
      doctorsList.innerHTML = `
        <div class="alert alert-info">
          <p>No available doctors found. Please try again later.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading doctors:', error);
    loadingDoctors.style.display = 'none';
    doctorsList.innerHTML = `
      <div class="alert alert-danger">
        <p>Error loading doctors. Please try again later.</p>
      </div>
    `;
  }
}

// Render doctor cards
function renderDoctorCards(container, doctors) {
  console.log('Rendering doctor cards for', doctors.length, 'doctors');
  
  doctors.forEach(doctor => {
    const card = document.createElement('div');
    card.className = 'card';
    
    // Get doctor name from user relationship
    const doctorName = doctor.user ? doctor.user.name : doctor.name;
    
    // Create card content
    card.innerHTML = `
      <div class="card-body">
        <h4 class="doctor-name">${doctorName}</h4>
        <p class="doctor-specialization">${doctor.specialization}</p>
        <p class="doctor-experience">${doctor.experience || 0} years experience</p>
        <button class="btn select-doctor-btn" data-id="${doctor._id}">Select Doctor</button>
      </div>
    `;
    
    // Add event listener to select button
    const selectButton = card.querySelector('.select-doctor-btn');
    console.log('Adding event listener to select button for doctor:', doctor._id);
    
    selectButton.addEventListener('click', () => {
      console.log('Select button clicked for doctor:', doctor._id);
      selectDoctor(doctor);
    });
    
    container.appendChild(card);
  });
}

// Handle doctor selection
function selectDoctor(doctor) {
  const formContainer = document.getElementById('appointment-form-container');
  const doctorIdInput = document.getElementById('selected-doctor-id');
  
  console.log('Selecting doctor:', doctor);
  
  // Store selected doctor data
  window.selectedDoctor = doctor;
  
  // Set doctor ID in form
  doctorIdInput.value = doctor._id;
  
  // Show appointment form
  formContainer.style.display = 'block';
  formContainer.scrollIntoView({ behavior: 'smooth' });
  
  // Setup date input with min date of today
  const dateInput = document.getElementById('appointment-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;
  dateInput.value = today;
  
  // Load available slots for today
  loadAvailableSlots(doctor._id, today);
  
  // Add event listener to date input only once
  if (!dateInput._hasChangeEventListener) {
    dateInput.addEventListener('change', () => {
      const selectedDate = dateInput.value;
      loadAvailableSlots(window.selectedDoctor._id, selectedDate);
    });
    dateInput._hasChangeEventListener = true;
    console.log('Added change event listener to date input');
  }
}

// Load available time slots for doctor on selected date
async function loadAvailableSlots(doctorId, date) {
  const slotsContainer = document.getElementById('available-slots');
  
  // Show loading
  slotsContainer.innerHTML = `
    <div style="text-align: center; padding: 20px 0;">
      <div class="loading-spinner"></div>
      <p>Loading available slots...</p>
    </div>
  `;
  
  try {
    // Get doctor's available slots for the selected date
    const response = await api.doctors.getDoctorSlots(doctorId, date);
    
    if (response.success) {
      if (response.data.length > 0) {
        // Create radio buttons for each available slot
        slotsContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 10px;">
            ${response.data.map(slot => `
              <label class="slot-option">
                <input type="radio" name="timeSlot" value="${slot}" required>
                <span>${utils.formatTime(slot)}</span>
              </label>
            `).join('')}
          </div>
        `;
      } else {
        slotsContainer.innerHTML = `
          <div class="alert alert-info" style="text-align: center;">
            <p>No available slots for this date. Please select another date.</p>
          </div>
        `;
      }
    } else {
      slotsContainer.innerHTML = `
        <div class="alert alert-danger">
          <p>Error loading slots: ${response.error}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading slots:', error);
    slotsContainer.innerHTML = `
      <div class="alert alert-danger">
        <p>Error loading slots. Please try again.</p>
        <p>Details: ${error.message || 'Unknown error'}</p>
      </div>
    `;
  }
}

// Setup appointment booking form
function setupBookingForm() {
  const form = document.getElementById('appointment-form');
  
  console.log('Setting up booking form', form);
  
  if (form) {
    // Check for onsubmit attribute
    console.log('Form onsubmit attribute:', form.getAttribute('onsubmit'));
    console.log('Form HTML:', form.outerHTML);
    
    // Clear any existing submit event listeners to avoid duplicates
    const clone = form.cloneNode(true);
    form.parentNode.replaceChild(clone, form);
    
    // Get the new form reference
    const newForm = document.getElementById('appointment-form');
    console.log('New form element:', newForm);
    
    // Get submit button
    const submitButton = newForm.querySelector('button[type="submit"]');
    console.log('Submit button:', submitButton);
    
    if (submitButton) {
      // Add a direct click handler to the button
      submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Submit button clicked, current form:', newForm);
        console.log('Submit button - submitting manually');
        
        // Trigger the actual form submission handler
        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        newForm.dispatchEvent(submitEvent);
      });
    }
    
    // Main form submit handler
    newForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('Form submit event triggered');
      
      // Get time slot
      const selectedSlot = document.querySelector('input[name="timeSlot"]:checked');
      console.log('Selected slot:', selectedSlot);
      
      if (!selectedSlot) {
        document.getElementById('time-slot-error').textContent = 'Please select a time slot';
        document.getElementById('time-slot-error').style.display = 'block';
        return;
      }
      
      // Get form data
      const doctorId = document.getElementById('selected-doctor-id').value;
      const date = document.getElementById('appointment-date').value;
      const startTime = selectedSlot.value;
      const reason = document.getElementById('reason').value;
      const priority = document.getElementById('priority').value;
      const notes = document.getElementById('notes').value;
      
      console.log('Form data:', { doctorId, date, startTime, reason, priority, notes });
      
      // Show loading state
      const submitButton = newForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.innerHTML = '<span class="loading-spinner-sm"></span> Booking...';
      submitButton.disabled = true;
      
      // Get user info
      try {
        // Fetch user info
        const userResponse = await api.auth.getCurrentUser();
        console.log('User info:', userResponse);
        
        if (!userResponse.success) {
          utils.showAlert('Authentication error. Please log in again.', 'error');
          return;
        }
        
        // Instead of trying to query for patients (which patients can't access),
        // directly try to create a patient profile - the backend will handle
        // if the profile already exists
        console.log('Creating/retrieving patient profile');
        const createResponse = await api.patients.createPatient({
          user: userResponse.data.id, // Use 'id' instead of '_id'
          gender: 'Other', 
          bloodGroup: 'Unknown',
          allergies: []
        });
        
        console.log('Create patient response:', createResponse);
        
        // Get patient ID from the response
        let patientId;
        if (createResponse.success && createResponse.data) {
          patientId = createResponse.data._id;
          console.log('Got patient ID:', patientId);
        } else {
          utils.showAlert('Failed to get patient profile: ' + (createResponse.error || 'Unknown error'), 'error');
          return;
        }
        
        // Create appointment
        console.log('Creating appointment with patient ID:', patientId);
        
        const appointmentData = {
          doctor: doctorId,
          patient: patientId,
          scheduledDate: date,
          startTime: startTime,
          reasonForVisit: reason,
          priority: priority,
          notes: notes
        };
        
        console.log('Sending appointment data:', appointmentData);
        
        // Create appointment
        const response = await api.appointments.createAppointment(appointmentData);
        console.log('Appointment creation response:', response);
        
        if (response.success) {
          utils.showAlert('Appointment booked successfully!', 'success');
          
          // Reset form
          newForm.reset();
          
          // Hide appointment form
          document.getElementById('appointment-form-container').style.display = 'none';
          
          // Reload upcoming appointments
          await loadUpcomingAppointments();
          
          // Switch to upcoming tab
          document.querySelector('.tab-button[data-tab="upcoming"]').click();
        } else {
          utils.showAlert(response.error || 'Failed to book appointment', 'error');
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        utils.showAlert('Error booking appointment: ' + error, 'error');
      } finally {
        // Reset button state
        submitButton.innerHTML = originalButtonText;
        submitButton.disabled = false;
      }
    });
  }
}

// Setup any modal close buttons
function setupModalCloseButtons() {
  // No modals currently in appointments.html, but this function is called in the HTML
  // This is a placeholder for future modals
}

// Load upcoming appointments
async function loadUpcomingAppointments() {
  const container = document.getElementById('upcoming-appointments-container');
  const loadingElement = document.getElementById('loading-upcoming');
  const noAppointmentsElement = document.getElementById('no-upcoming');
  
  // Show loading
  loadingElement.style.display = 'block';
  noAppointmentsElement.style.display = 'none';
  
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format the date for the API
    const formattedDate = today.toISOString().split('T')[0];
    
    // Query for appointments:
    // 1. From today onward
    // 2. NOT cancelled or completed
    const query = `?scheduledDate[gte]=${formattedDate}&status[nin]=cancelled,completed&sort=scheduledDate`;
    console.log('Fetching upcoming appointments with query:', query);
    const response = await api.appointments.getAllAppointments(query);
    
    console.log('Upcoming appointments response:', response);
    
    // Hide loading
    loadingElement.style.display = 'none';
    
    if (response.success && response.data.length > 0) {
      // Create appointments list
      const appointmentsList = document.createElement('div');
      appointmentsList.className = 'appointments-list';
      
      console.log(`Processing ${response.data.length} upcoming appointments`);
      
      response?.data?.forEach((appointment, index) => {
        try {
          console.log(`Creating card for appointment ${index}:`, appointment);
          const card = createAppointmentCard(appointment);
          appointmentsList.appendChild(card);
        } catch (cardError) {
          console.error(`Error creating card for appointment ${index}:`, cardError, appointment);
          const errorCard = document.createElement('div');
          errorCard.className = 'card error-card';
          errorCard.innerHTML = `<div class="card-body">
            <p>Error displaying this appointment: ${cardError.message}</p>
          </div>`;
          appointmentsList.appendChild(errorCard);
        }
      });
      
      // Clear container (except for loading and no-upcoming elements)
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      container.appendChild(loadingElement);
      container.appendChild(noAppointmentsElement);
      container.appendChild(appointmentsList);
    } else {
      console.log('No upcoming appointments found or success=false');
      noAppointmentsElement.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading upcoming appointments:', error);
    loadingElement.style.display = 'none';
    container.innerHTML += `
      <div class="alert alert-danger">
        <p>Error loading appointments. Please try again later.</p>
        <p>Details: ${error.message || 'Unknown error'}</p>
      </div>
    `;
  }
}

// Load past appointments
async function loadPastAppointments() {
  const container = document.getElementById('past-appointments-container');
  const loadingElement = document.getElementById('loading-past');
  const noAppointmentsElement = document.getElementById('no-past');
  
  // Show loading
  loadingElement.style.display = 'block';
  noAppointmentsElement.style.display = 'none';
  
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Format the date for the API
    const formattedDate = today.toISOString().split('T')[0];
    
    // Modified query to include appointments that are either:
    // 1. Before today's date, OR
    // 2. Have status of cancelled or completed
    const query = `?$or[0][scheduledDate][lt]=${formattedDate}&$or[1][status][in]=cancelled,completed&sort=-scheduledDate`;
    console.log('Fetching past appointments with query:', query);
    
    const response = await api.appointments.getAllAppointments(query);
    console.log('Past appointments response:', response);
    
    // Hide loading
    loadingElement.style.display = 'none';
    
    if (response.success && response.data.length > 0) {
      // Create appointments list
      const appointmentsList = document.createElement('div');
      appointmentsList.className = 'appointments-list';
      
      console.log(`Processing ${response.data.length} past appointments`);
      
      response.data.forEach((appointment, index) => {
        try {
          console.log(`Creating card for past appointment ${index}:`, appointment);
          const card = createAppointmentCard(appointment, true);
          appointmentsList.appendChild(card);
        } catch (cardError) {
          console.error(`Error creating card for past appointment ${index}:`, cardError, appointment);
          const errorCard = document.createElement('div');
          errorCard.className = 'card error-card';
          errorCard.innerHTML = `<div class="card-body">
            <p>Error displaying this appointment: ${cardError.message}</p>
          </div>`;
          appointmentsList.appendChild(errorCard);
        }
      });
      
      // Clear container (except for loading and no-past elements)
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      
      container.appendChild(loadingElement);
      container.appendChild(noAppointmentsElement);
      container.appendChild(appointmentsList);
    } else {
      console.log('No past appointments found or success=false');
      noAppointmentsElement.style.display = 'block';
    }
  } catch (error) {
    console.error('Error loading past appointments:', error);
    loadingElement.style.display = 'none';
    container.innerHTML += `
      <div class="alert alert-danger">
        <p>Error loading appointments. Please try again later.</p>
        <p>Details: ${error.message || 'Unknown error'}</p>
      </div>
    `;
  }
}

// Create appointment card
function createAppointmentCard(appointment, isPast = false) {
  const card = document.createElement('div');
  card.className = 'card mb-3';
  
  // Format date and time
  const appointmentDate = new Date(appointment.scheduledDate);
  const formattedDate = appointmentDate.toLocaleDateString();
  
  // Get doctor and patient names
  let doctorName = 'Unknown Doctor';
  let patientName = 'Unknown Patient';
  
  if (appointment.doctor) {
    if (appointment.doctor.user) {
      doctorName = `Dr. ${appointment.doctor.user.name}`;
    } else if (appointment.doctor.name) {
      doctorName = `Dr. ${appointment.doctor.name}`;
    }
  }
  
  if (appointment.patient) {
    if (appointment.patient.user) {
      patientName = appointment.patient.user.name;
    } else if (appointment.patient.name) {
      patientName = appointment.patient.name;
    }
  }
  
  // Status badge class
  let statusClass = '';
  switch (appointment.status) {
    case 'scheduled':
      statusClass = 'status-scheduled';
      break;
    case 'completed':
      statusClass = 'status-completed';
      break;
    case 'cancelled':
      statusClass = 'status-cancelled';
      break;
    case 'rescheduled':
      statusClass = 'status-rescheduled';
      break;
    case 'no-show':
      statusClass = 'status-no-show';
      break;
  }
  
  // Priority badge class
  let priorityClass = '';
  switch (appointment.priority) {
    case 'emergency':
      priorityClass = 'priority-emergency';
      break;
    case 'high':
      priorityClass = 'priority-high';
      break;
    case 'normal':
      priorityClass = 'priority-normal';
      break;
    case 'low':
      priorityClass = 'priority-low';
      break;
  }
  
  // Create card content
  card.innerHTML = `
    <div class="card-body">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <h4 class="card-title">${doctorName}</h4>
          <p class="card-subtitle">${appointment.doctor?.specialization || 'Specialist'}</p>
        </div>
        <div>
          <span class="status-badge ${statusClass}">${utils.capitalize(appointment.status)}</span>
          <span class="priority-tag ${priorityClass}">${utils.capitalize(appointment.priority)}</span>
        </div>
      </div>
      
      <div style="margin-top: 15px;">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Time:</strong> ${appointment.startTime} - ${appointment.endTime}</p>
        <p><strong>Reason:</strong> ${appointment.reasonForVisit}</p>
      </div>
      
      ${!isPast && appointment.status === 'scheduled' ? `
        <div style="margin-top: 15px;">
          <button class="btn btn-secondary cancel-appointment-btn" data-id="${appointment._id}">Cancel Appointment</button>
        </div>
      ` : ''}
    </div>
  `;
  
  // Add event listener to cancel button
  if (!isPast && appointment.status === 'scheduled') {
    card.querySelector('.cancel-appointment-btn').addEventListener('click', () => {
      cancelAppointment(appointment._id);
    });
  }
  
  return card;
}

// Cancel appointment
async function cancelAppointment(appointmentId) {
  if (confirm('Are you sure you want to cancel this appointment?')) {
    // Get and update the cancel button
    const cancelButton = document.querySelector(`.cancel-appointment-btn[data-id="${appointmentId}"]`);
    const originalButtonText = cancelButton.textContent;
    cancelButton.innerHTML = '<span class="loading-spinner-sm"></span> Cancelling...';
    cancelButton.disabled = true;
    
    try {
      // Update appointment status to cancelled
      const response = await api.appointments.updateAppointment(appointmentId, {
        status: 'cancelled'
      });
      
      if (response.success) {
        utils.showAlert('Appointment cancelled successfully', 'success');
        
        // Reload upcoming appointments
        await loadUpcomingAppointments();
        
        // Reload past appointments (since cancelled appointments might move there)
        await loadPastAppointments();
      } else {
        utils.showAlert(response.error || 'Failed to cancel appointment', 'error');
        // Reset button state on error
        cancelButton.innerHTML = originalButtonText;
        cancelButton.disabled = false;
      }
    } catch (error) {
      utils.showAlert('Error cancelling appointment: ' + error, 'error');
      // Reset button state on error
      cancelButton.innerHTML = originalButtonText;
      cancelButton.disabled = false;
    }
  }
}

// Add CSS for appointment cards
const style = document.createElement('style');
style.textContent = `
  .appointments-list {
    margin-top: 20px;
  }
  
  .slot-option {
    display: block;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .slot-option:hover {
    background-color: #f8f9fa;
  }
  
  .slot-option input {
    margin-right: 8px;
  }
  
  .status-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 14px;
    margin-left: 5px;
  }
  
  .status-scheduled {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .status-completed {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .status-cancelled {
    background-color: #ffebee;
    color: #d32f2f;
  }
  
  .status-rescheduled {
    background-color: #fff8e1;
    color: #f57c00;
  }
  
  .status-no-show {
    background-color: #f3e5f5;
    color: #7b1fa2;
  }
  
  .priority-tag {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 12px;
    font-size: 14px;
    margin-left: 5px;
  }
  
  .priority-emergency {
    background-color: #ffebee;
    color: #d32f2f;
  }
  
  .priority-high {
    background-color: #fff8e1;
    color: #f57c00;
  }
  
  .priority-normal {
    background-color: #e3f2fd;
    color: #1976d2;
  }
  
  .priority-low {
    background-color: #e8f5e9;
    color: #388e3c;
  }
  
  .loading-spinner-sm {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255,255,255,0.3);
    border-radius: 50%;
    border-top-color: #fff;
    animation: spin 1s ease-in-out infinite;
    margin-right: 8px;
    vertical-align: middle;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

document.head.appendChild(style);

// Ensure all book appointment buttons have event listeners
function setupBookButtons() {
  console.log('Setting up book appointment buttons');
  const bookButtons = document.querySelectorAll('.book-appointment-btn');
  bookButtons.forEach(button => {
    // Remove any existing listeners to avoid duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    // Add fresh event listener
    const doctorId = newButton.getAttribute('data-id');
    console.log('Setting up book button for doctor:', doctorId);
    newButton.addEventListener('click', (e) => {
      e.preventDefault();
      console.log('Book button clicked for doctor:', doctorId);
      
      // Find the doctor in our list
      const doctor = window.allDoctors.find(doc => doc._id === doctorId);
      if (doctor) {
        selectDoctor(doctor);
      } else {
        console.error('Doctor not found in list:', doctorId);
      }
    });
  });
} 