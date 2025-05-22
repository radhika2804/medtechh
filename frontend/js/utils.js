// Utility functions for Healthcare Scheduling System

// DOM helpers
const utils = {
  // Get element by ID
  getById: (id) => document.getElementById(id),
  
  // Create element with attributes and content
  createElement: (tag, attributes = {}, content = '') => {
    const element = document.createElement(tag);
    
    // Set attributes
    for (const [key, value] of Object.entries(attributes)) {
      if (key === 'class' || key === 'className') {
        element.className = value;
      } else {
        element.setAttribute(key, value);
      }
    }
    
    // Set content
    if (content) {
      element.innerHTML = content;
    }
    
    return element;
  },
  
  // Capitalize first letter of a string
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },
  
  // Show element
  showElement: (element) => {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (element) {
      element.style.display = '';
    }
  },
  
  // Hide element
  hideElement: (element) => {
    if (typeof element === 'string') {
      element = document.getElementById(element);
    }
    if (element) {
      element.style.display = 'none';
    }
  },
  
  // Show alert message
  showAlert: (message, type = 'error', container = 'alert-container', timeout = 5000) => {
    const alertContainer = document.getElementById(container);
    if (!alertContainer) return;
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Add to container
    alertContainer.appendChild(alert);
    
    // Auto-remove after timeout
    if (timeout > 0) {
      setTimeout(() => {
        alert.remove();
      }, timeout);
    }
    
    return alert;
  },
  
  // Clear form inputs
  clearForm: (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (input.type === 'checkbox' || input.type === 'radio') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  },
  
  // Format date to YYYY-MM-DD
  formatDate: (date) => {
    if (!date) return '';
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toISOString().split('T')[0];
  },
  
  // Format date to readable format (e.g., Jan 1, 2023)
  formatReadableDate: (date) => {
    if (!date) return '';
    
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },
  
  // Format time (e.g., 09:00 to 9:00 AM)
  formatTime: (time) => {
    if (!time) return '';
    
    // Handle 24-hour format
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  },
  
  // Validate email
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate password (min 8 chars, at least 1 letter and 1 number)
  isValidPassword: (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return passwordRegex.test(password);
  },
  
  // Validate form inputs
  validateForm: (formId, validations) => {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    let isValid = true;
    const errors = {};
    
    // Check each validation rule
    for (const [field, rules] of Object.entries(validations)) {
      const input = form.querySelector(`[name="${field}"]`);
      if (!input) continue;
      
      const value = input.value.trim();
      
      // Required check
      if (rules.required && !value) {
        errors[field] = `${rules.label || field} is required`;
        isValid = false;
        continue;
      }
      
      // Min length check
      if (rules.minLength && value.length < rules.minLength) {
        errors[field] = `${rules.label || field} must be at least ${rules.minLength} characters`;
        isValid = false;
        continue;
      }
      
      // Email check
      if (rules.email && !utils.isValidEmail(value)) {
        errors[field] = `Please enter a valid email address`;
        isValid = false;
        continue;
      }
      
      // Password check
      // if (rules.password && !utils.isValidPassword(value)) {
      //   errors[field] = `Password must be at least 8 characters and contain both letters and numbers`;
      //   isValid = false;
      //   continue;
      // }
      if (rules.password) {
        if (!value) {
          errors[field] = `Password is required`;
          isValid = false;
          continue;
        }
        if (value.length < 8) {
          errors[field] = `Password must be at least 8 characters`;
          isValid = false; 
          continue;
        }
        if (!/[A-Za-z]/.test(value)) {
          errors[field] = `Password must contain at least one letter`;
          isValid = false;
          continue;
        }
        if (!/\d/.test(value)) {
          errors[field] = `Password must contain at least one number`;
          isValid = false;
          continue;
        }
      }
      // Custom validator
      if (rules.validator && typeof rules.validator === 'function') {
        const validatorResult = rules.validator(value);
        if (validatorResult !== true) {
          errors[field] = validatorResult || `Invalid ${rules.label || field}`;
          isValid = false;
          continue;
        }
      }
    }
    
    // Display errors if any
    for (const [field, message] of Object.entries(errors)) {
      const errorElement = form.querySelector(`#${field}-error`);
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
    }
    
    return isValid ? true : errors;
  },
  
  // Clear validation errors
  clearValidationErrors: (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const errorElements = form.querySelectorAll('[id$="-error"]');
    errorElements.forEach(element => {
      element.textContent = '';
      element.style.display = 'none';
    });
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Check user role
  getUserRole: () => {
    try {
      // First check if role is stored in localStorage
      const storedRole = localStorage.getItem('userRole');
      if (storedRole) {
        return storedRole;
      }
      
      // Fall back to extracting from token if not found in localStorage
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Extract user data from token (assuming JWT)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const { role } = JSON.parse(jsonPayload);
      return role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },
  
  // Generate pagination controls
  generatePagination: (currentPage, totalPages, containerElement) => {
    if (!containerElement) return;
    
    containerElement.innerHTML = '';
    
    // Previous button
    const prevButton = utils.createElement('button', {
      class: 'btn btn-sm',
      disabled: currentPage <= 1
    }, '&laquo; Previous');
    
    if (currentPage > 1) {
      prevButton.addEventListener('click', () => {
        // Handle page change (dispatch custom event)
        containerElement.dispatchEvent(new CustomEvent('pageChange', {
          detail: { page: currentPage - 1 }
        }));
      });
    }
    
    containerElement.appendChild(prevButton);
    
    // Page buttons
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      const pageButton = utils.createElement('button', {
        class: i === currentPage ? 'btn btn-sm btn-primary' : 'btn btn-sm',
      }, i.toString());
      
      if (i !== currentPage) {
        pageButton.addEventListener('click', () => {
          // Handle page change
          containerElement.dispatchEvent(new CustomEvent('pageChange', {
            detail: { page: i }
          }));
        });
      }
      
      containerElement.appendChild(pageButton);
    }
    
    // Next button
    const nextButton = utils.createElement('button', {
      class: 'btn btn-sm',
      disabled: currentPage >= totalPages
    }, 'Next &raquo;');
    
    if (currentPage < totalPages) {
      nextButton.addEventListener('click', () => {
        // Handle page change
        containerElement.dispatchEvent(new CustomEvent('pageChange', {
          detail: { page: currentPage + 1 }
        }));
      });
    }
    
    containerElement.appendChild(nextButton);
  },
  
  // Priority to display text
  priorityToText: (priority) => {
    const map = {
      'low': 'Low',
      'normal': 'Normal',
      'high': 'High',
      'emergency': 'Emergency'
    };
    return map[priority] || 'Unknown';
  },
  
  // Status to display text
  statusToText: (status) => {
    const map = {
      'scheduled': 'Scheduled',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'rescheduled': 'Rescheduled',
      'no-show': 'No Show'
    };
    return map[status] || 'Unknown';
  }
};

// Make available globally
window.utils = utils; 