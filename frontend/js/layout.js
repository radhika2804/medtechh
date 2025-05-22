// Healthcare Scheduling System - Common Layout Elements

/**
 * Initialize layout elements based on authentication status
 */
function initializeLayout() {
  // Update navigation based on authentication
  updateNavigation();
  
  // Add event listener for logout
  setupLogout();
  
  // Display alerts container if it doesn't exist
  ensureAlertContainer();
}

/**
 * Update navigation based on authentication status
 */
function updateNavigation() {
  const isAuthenticated = utils.isAuthenticated();
  const userRole = utils.getUserRole();
  
  // Get navigation elements
  const loginLink = document.getElementById('login-link');
  const registerLink = document.getElementById('register-link');
  const logoutLink = document.getElementById('logout-link');
  const accountLink = document.getElementById('account-link');
  const adminLink = document.getElementById('admin-link');
  
  // Update login/register/logout links
  if (loginLink) loginLink.style.display = isAuthenticated ? 'none' : 'inline-block';
  if (registerLink) registerLink.style.display = isAuthenticated ? 'none' : 'inline-block';
  if (logoutLink) logoutLink.style.display = isAuthenticated ? 'inline-block' : 'none';
  if (accountLink) accountLink.style.display = isAuthenticated ? 'inline-block' : 'none';
  
  // Show admin link for admin users
  if (adminLink) adminLink.style.display = (userRole === 'admin') ? 'inline-block' : 'none';
  
  // Add active class to current page link
  highlightCurrentPage();
}

/**
 * Highlight the current page in the navigation
 */
function highlightCurrentPage() {
  // Get current page path
  const currentPath = window.location.pathname;
  
  // Find all nav links
  const navLinks = document.querySelectorAll('.nav-links a');
  
  // Remove active class from all links
  navLinks.forEach(link => {
    link.classList.remove('active');
    
    // Get href without any query parameters
    const linkPath = link.getAttribute('href').split('?')[0];
    
    // Check if this link matches the current page
    if (currentPath.endsWith(linkPath)) {
      link.classList.add('active');
    }
  });
}

/**
 * Setup logout functionality
 */
function setupLogout() {
  const logoutLink = document.getElementById('logout-link');
  
  if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
      e.preventDefault();
      api.auth.logout();
      utils.showAlert('You have been logged out successfully.', 'success');
      setTimeout(() => {
        // Determine the path to redirect to
        const isInSubfolder = window.location.pathname.includes('/pages/');
        window.location.href = isInSubfolder ? '../index.html' : 'index.html';
      }, 1000);
    });
  }
}

/**
 * Ensure alert container exists
 */
function ensureAlertContainer() {
  if (!document.getElementById('alert-container')) {
    const alertContainer = document.createElement('div');
    alertContainer.id = 'alert-container';
    alertContainer.style.position = 'fixed';
    alertContainer.style.top = '20px';
    alertContainer.style.right = '20px';
    alertContainer.style.zIndex = '1000';
    document.body.appendChild(alertContainer);
  }
}

// Initialize layout when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeLayout); 