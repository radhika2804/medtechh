// API utility functions for Healthcare Scheduling System

// Base API URL
const API_BASE_URL = 'http://localhost:5000/api';

// Store the auth token
let authToken = localStorage.getItem('token') || '';

// Set auth token
const setAuthToken = (token) => {
  authToken = token;
  localStorage.setItem('token', token);
};

// Clear auth token (logout)
const clearAuthToken = () => {
  authToken = '';
  localStorage.removeItem('token');
};

// Get auth token
const getAuthToken = () => {
  return authToken;
};

// Headers with auth token
const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': authToken ? `Bearer ${authToken}` : ''
  };
};

// Handle API errors
const handleApiError = (error) => {
  if (error.status === 401) {
    // Unauthorized - token expired or invalid
    clearAuthToken();
    window.location.href = '/login.html';
    return;
  }
  
  // Return error message or a default one
  return error.message || 'An error occurred. Please try again.';
};

// Basic fetch wrapper
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });
    
    // Parse response JSON
    const data = await response.json();
    
    // Check if response was successful
    if (!response.ok) {
      throw {
        status: response.status,
        message: data.error || `API error: ${response.statusText}`
      };
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API Functions

// Authentication
const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const data = await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
      
      if (data.success && data.token) {
        setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const data = await fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (data.success && data.token) {
        setAuthToken(data.token);
      }
      
      return data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await fetchAPI('/auth/me');
      if (response.success && response.data && response.data.role) {
        // Store user role in localStorage for easier access
        localStorage.setItem('userRole', response.data.role);
        console.log('User role stored in localStorage:', response.data.role);
      }
      return response;
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Logout user
  logout: () => {
    clearAuthToken();
    // Also clear user role from localStorage
    localStorage.removeItem('userRole');
  }
};

// Doctors API
const doctorsAPI = {
  // Get all doctors
  getAllDoctors: async (query = '') => {
    try {
      return await fetchAPI(`/doctors${query}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get doctor by ID
  getDoctorById: async (id) => {
    try {
      return await fetchAPI(`/doctors/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get doctor's available slots
  getDoctorSlots: async (id, date) => {
    try {
      return await fetchAPI(`/doctors/${id}/slots?date=${date}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Create doctor (admin only)
  createDoctor: async (doctorData) => {
    try {
      return await fetchAPI('/doctors', {
        method: 'POST',
        body: JSON.stringify(doctorData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update doctor 
  updateDoctor: async (id, doctorData) => {
    try {
      return await fetchAPI(`/doctors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(doctorData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Patients API
const patientsAPI = {
  // Get all patients (admin/doctor only)
  getAllPatients: async (query = '') => {
    try {
      return await fetchAPI(`/patients${query}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get patient by ID
  getPatientById: async (id) => {
    try {
      return await fetchAPI(`/patients/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get patient's medical history
  getPatientMedicalHistory: async (id) => {
    try {
      return await fetchAPI(`/patients/${id}/medical-history`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Create patient
  createPatient: async (patientData) => {
    try {
      return await fetchAPI('/patients', {
        method: 'POST',
        body: JSON.stringify(patientData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update patient
  updatePatient: async (id, patientData) => {
    try {
      return await fetchAPI(`/patients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(patientData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Appointments API
const appointmentsAPI = {
  // Get all appointments
  getAllAppointments: async (query = '') => {
    try {
      return await fetchAPI(`/appointments${query}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Get appointment by ID
  getAppointmentById: async (id) => {
    try {
      return await fetchAPI(`/appointments/${id}`);
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Create appointment
  createAppointment: async (appointmentData) => {
    try {
      return await fetchAPI('/appointments', {
        method: 'POST',
        body: JSON.stringify(appointmentData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Update appointment
  updateAppointment: async (id, appointmentData) => {
    try {
      return await fetchAPI(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(appointmentData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Cancel appointment
  cancelAppointment: async (id) => {
    try {
      return await fetchAPI(`/appointments/${id}/cancel`, {
        method: 'PUT'
      });
    } catch (error) {
      throw handleApiError(error);
    }
  },
  
  // Auto-schedule appointments (admin only)
  autoScheduleAppointments: async (schedulingData) => {
    try {
      return await fetchAPI('/appointments/auto-schedule', {
        method: 'POST',
        body: JSON.stringify(schedulingData)
      });
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Export all API functions
window.api = {
  auth: authAPI,
  doctors: doctorsAPI,
  patients: patientsAPI,
  appointments: appointmentsAPI,
  setAuthToken,
  getAuthToken,
  clearAuthToken
}; 