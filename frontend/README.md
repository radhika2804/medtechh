# Healthcare Scheduling System - Frontend

This is the frontend implementation for the Healthcare Scheduling System, a comprehensive platform for managing healthcare appointments with priority-based scheduling.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- RESTful API Integration

## Features

### User Authentication
- Login
- Registration (Patient/Doctor)
- Role-based access control

### Doctor Management
- Doctor listings and search
- Doctor profiles
- Availability management
- Specialization filtering

### Patient Management
- Patient profiles
- Medical history
- Priority-based scheduling

### Appointment System
- Book appointments
- View upcoming appointments
- Cancel/reschedule appointments
- Auto-scheduling with priority algorithm

### Admin Dashboard
- System statistics
- User management
- Appointment management
- Advanced scheduling controls

## Project Structure

```
frontend/
├── css/
│   └── style.css            # Main stylesheet
├── js/
│   ├── api.js               # API integration functions
│   ├── utils.js             # Utility functions
│   └── scheduler.js         # Scheduling algorithm
├── img/                     # Image assets
├── pages/
│   ├── admin/               # Admin pages
│   │   └── dashboard.html   # Admin dashboard
│   ├── appointments.html    # Appointment booking and management
│   ├── doctors.html         # Doctor listing and search
│   ├── login.html           # User login
│   ├── register.html        # User registration
│   └── account.html         # User account settings
└── index.html               # Homepage
```

## Priority-Based Scheduling

The system implements a greedy algorithm for scheduling appointments based on priority levels:

1. **Emergency** - Highest priority for life-threatening conditions
2. **High** - Urgent medical issues requiring prompt attention
3. **Normal** - Standard medical appointments
4. **Low** - Non-urgent medical needs

The scheduler:
- Sorts patients by priority level
- Within the same priority, uses first-come-first-served approach
- Matches patients with appropriate doctors
- Optimizes time slot allocation
- Automatically reschedules when emergency cases arise

## Getting Started

1. Clone the repository
2. Ensure the backend API is running
3. Open `index.html` in a web browser or serve the entire frontend directory using a static file server

```bash
# Example using Node.js http-server
npm install -g http-server
cd frontend
http-server -p 8080
```

4. Access the application at http://localhost:8080

## API Integration

The frontend connects to a RESTful API with endpoints for:
- User authentication
- Doctor management
- Patient management
- Appointment scheduling

All API calls are handled through the `api.js` utility which provides a clean interface for making requests.

## Browser Compatibility

The application is designed to work with all modern browsers including:
- Chrome
- Firefox
- Safari
- Edge

## Responsiveness

The UI is fully responsive and adapts to different screen sizes:
- Desktop
- Tablet
- Mobile

## Future Enhancements

- Real-time notifications
- Online consultation integration
- Payment processing
- Enhanced medical record management
- Advanced reporting and analytics 