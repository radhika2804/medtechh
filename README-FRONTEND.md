# Healthcare Scheduling System - Frontend Integration Guide

## Overview

This healthcare scheduling system provides a robust backend for managing doctors, patients, and appointments in a medical facility. It includes features such as user authentication, doctor and patient profile management, appointment scheduling, and an intelligent scheduling algorithm.

This document serves as a comprehensive guide for frontend developers to integrate with the backend API.

## Tech Stack - Backend

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Recommended Tech Stack - Frontend

- **React.js** or **Vue.js** - Frontend framework
- **Axios** or **fetch** - API requests
- **React Router/Vue Router** - Client-side routing
- **Redux/Vuex/Context API** - State management
- **Material-UI/Ant Design/Tailwind CSS** - UI components

## Getting Started

### Backend Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Backend Installation

1. Navigate to the backend directory:
   ```
   cd backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables in `.env` file:
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/healthcare_scheduling_system
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=30d
   ```
4. Start the server:
   ```
   npm run start
   ```
   Or for development with auto-reload:
   ```
   npm run dev
   ```

## Data Models

### User

The base user model for authentication:

```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  role: String ['admin', 'doctor', 'patient', 'staff'],
  createdAt: Date
}
```

### Doctor

Contains professional information about doctors:

```javascript
{
  user: ObjectId (reference to User),
  specialization: String,
  qualifications: [String],
  experience: Number,
  licenseNumber: String,
  fees: Number,
  availableSlots: [{
    day: String,
    startTime: String,
    endTime: String,
    slotDuration: Number,
    maxPatients: Number
  }],
  contactInfo: {
    phone: String,
    address: String
  },
  rating: Number,
  reviews: [{
    patient: ObjectId,
    text: String,
    rating: Number,
    date: Date
  }]
}
```

### Patient

Contains medical information about patients:

```javascript
{
  user: ObjectId (reference to User),
  dateOfBirth: Date,
  gender: String,
  bloodGroup: String,
  allergies: [String],
  chronicDiseases: [String],
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  contactInfo: {
    phone: String,
    address: String
  },
  insuranceInfo: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  medicalHistory: [{
    condition: String,
    diagnosedDate: Date,
    treatment: String,
    notes: String
  }],
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    startDate: Date,
    endDate: Date
  }]
}
```

### Appointment

Records scheduled appointments between doctors and patients:

```javascript
{
  doctor: ObjectId (reference to Doctor),
  patient: ObjectId (reference to Patient),
  scheduledDate: Date,
  startTime: String,
  endTime: String,
  status: String ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no-show'],
  reasonForVisit: String,
  symptoms: [String],
  priority: String ['low', 'normal', 'high', 'emergency'],
  notes: String,
  diagnosis: String,
  prescription: [{
    medication: String,
    dosage: String,
    frequency: String,
    duration: String,
    specialInstructions: String
  }],
  followUpNeeded: Boolean,
  followUpDate: Date,
  paymentStatus: String ['pending', 'paid', 'insurance', 'waived'],
  paymentAmount: Number
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. Register a user
2. Login to get a token
3. Include the token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <your_token>
   ```

## API Endpoints

### Authentication

#### Register a User

```
POST /api/auth/register
```

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### Login

```
POST /api/auth/login
```

Request body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

#### Get Current User

```
GET /api/auth/me
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ca",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "createdAt": "2023-11-15T12:00:00.000Z"
  }
}
```

### Doctors

#### Get All Doctors

```
GET /api/doctors
```

Query parameters:
- `specialization`: Filter by specialization
- `sort`: Sort results (e.g., `sort=fees` or `sort=-rating`)
- `page`: Page number
- `limit`: Results per page

Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": { "page": 2, "limit": 10 }
  },
  "data": [
    {
      "_id": "60d0fe4f5311236168a109cb",
      "user": {
        "_id": "60d0fe4f5311236168a109cc",
        "name": "Dr. Jane Smith",
        "email": "jane@example.com"
      },
      "specialization": "Cardiology",
      "qualifications": ["MD", "PhD"],
      "experience": 10,
      "fees": 150,
      "rating": 4.8
    }
    // More doctors...
  ]
}
```

#### Get Doctor by ID

```
GET /api/doctors/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "user": {
      "_id": "60d0fe4f5311236168a109cc",
      "name": "Dr. Jane Smith",
      "email": "jane@example.com"
    },
    "specialization": "Cardiology",
    "qualifications": ["MD", "PhD"],
    "experience": 10,
    "fees": 150,
    "availableSlots": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "slotDuration": 30,
        "maxPatients": 1
      }
      // More slots...
    ],
    "contactInfo": {
      "phone": "123-456-7890",
      "address": "123 Medical Center, City"
    },
    "rating": 4.8,
    "reviews": [
      {
        "patient": "60d0fe4f5311236168a109cd",
        "text": "Great doctor!",
        "rating": 5,
        "date": "2023-11-10T12:00:00.000Z"
      }
      // More reviews...
    ]
  }
}
```

#### Get Doctor's Available Slots

```
GET /api/doctors/:id/slots?date=YYYY-MM-DD
```

Response:
```json
{
  "success": true,
  "count": 16,
  "data": [
    {
      "startTime": "09:00",
      "endTime": "09:30",
      "duration": 30
    },
    {
      "startTime": "09:30",
      "endTime": "10:00",
      "duration": 30
    }
    // More slots...
  ]
}
```

### Patients

#### Get All Patients (Admin/Doctor Only)

```
GET /api/patients
```

Query parameters:
- `sort`: Sort results (e.g., `sort=-createdAt`)
- `page`: Page number
- `limit`: Results per page

Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": { "page": 2, "limit": 10 }
  },
  "data": [
    {
      "_id": "60d0fe4f5311236168a109cd",
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "gender": "Male",
      "bloodGroup": "A+",
      "contactInfo": {
        "phone": "123-456-7890",
        "address": "456 Residential St, City"
      }
    }
    // More patients...
  ]
}
```

#### Get Patient by ID

```
GET /api/patients/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cd",
    "user": {
      "_id": "60d0fe4f5311236168a109ca",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "gender": "Male",
    "bloodGroup": "A+",
    "allergies": ["Penicillin"],
    "chronicDiseases": ["Hypertension"],
    "emergencyContact": {
      "name": "Jane Doe",
      "relation": "Spouse",
      "phone": "123-456-7891"
    },
    "contactInfo": {
      "phone": "123-456-7890",
      "address": "456 Residential St, City"
    },
    "insuranceInfo": {
      "provider": "Health Insurance Co",
      "policyNumber": "POL123456",
      "expiryDate": "2024-12-31T00:00:00.000Z"
    },
    "medicalHistory": [
      {
        "condition": "Appendicitis",
        "diagnosedDate": "2010-05-15T00:00:00.000Z",
        "treatment": "Appendectomy",
        "notes": "Successful surgery, no complications"
      }
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "startDate": "2020-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get Patient's Medical History

```
GET /api/patients/:id/medical-history
```

Response:
```json
{
  "success": true,
  "data": {
    "medicalHistory": [
      {
        "condition": "Appendicitis",
        "diagnosedDate": "2010-05-15T00:00:00.000Z",
        "treatment": "Appendectomy",
        "notes": "Successful surgery, no complications"
      }
    ],
    "medications": [
      {
        "name": "Lisinopril",
        "dosage": "10mg",
        "frequency": "Once daily",
        "startDate": "2020-01-01T00:00:00.000Z"
      }
    ],
    "allergies": ["Penicillin"],
    "chronicDiseases": ["Hypertension"]
  }
}
```

### Appointments

#### Get All Appointments

```
GET /api/appointments
```

Query parameters:
- `sort`: Sort results (e.g., `sort=-scheduledDate`)
- `page`: Page number
- `limit`: Results per page
- `status`: Filter by status

Response:
```json
{
  "success": true,
  "count": 2,
  "pagination": {
    "next": { "page": 2, "limit": 10 }
  },
  "data": [
    {
      "_id": "60d0fe4f5311236168a109ce",
      "doctor": {
        "_id": "60d0fe4f5311236168a109cb",
        "user": {
          "_id": "60d0fe4f5311236168a109cc",
          "name": "Dr. Jane Smith",
          "email": "jane@example.com"
        },
        "specialization": "Cardiology",
        "fees": 150
      },
      "patient": {
        "_id": "60d0fe4f5311236168a109cd",
        "user": {
          "_id": "60d0fe4f5311236168a109ca",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "dateOfBirth": "1990-01-01T00:00:00.000Z",
        "gender": "Male"
      },
      "scheduledDate": "2023-12-01T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "scheduled",
      "reasonForVisit": "Regular checkup",
      "priority": "normal",
      "paymentStatus": "pending",
      "paymentAmount": 150
    }
    // More appointments...
  ]
}
```

#### Get Appointment by ID

```
GET /api/appointments/:id
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ce",
    "doctor": {
      "_id": "60d0fe4f5311236168a109cb",
      "user": {
        "_id": "60d0fe4f5311236168a109cc",
        "name": "Dr. Jane Smith",
        "email": "jane@example.com"
      },
      "specialization": "Cardiology",
      "fees": 150
    },
    "patient": {
      "_id": "60d0fe4f5311236168a109cd",
      "user": {
        "_id": "60d0fe4f5311236168a109ca",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "dateOfBirth": "1990-01-01T00:00:00.000Z",
      "gender": "Male"
    },
    "scheduledDate": "2023-12-01T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "scheduled",
    "reasonForVisit": "Regular checkup",
    "symptoms": ["Headache", "Dizziness"],
    "priority": "normal",
    "notes": "",
    "diagnosis": "",
    "prescription": [],
    "followUpNeeded": false,
    "paymentStatus": "pending",
    "paymentAmount": 150,
    "createdAt": "2023-11-15T12:00:00.000Z"
  }
}
```

#### Create Appointment

```
POST /api/appointments
```

Request body:
```json
{
  "doctor": "60d0fe4f5311236168a109cb",
  "patient": "60d0fe4f5311236168a109cd",
  "scheduledDate": "2023-12-01",
  "startTime": "09:00",
  "reasonForVisit": "Regular checkup",
  "symptoms": ["Headache", "Dizziness"],
  "priority": "normal"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109ce",
    "doctor": "60d0fe4f5311236168a109cb",
    "patient": "60d0fe4f5311236168a109cd",
    "scheduledDate": "2023-12-01T00:00:00.000Z",
    "startTime": "09:00",
    "endTime": "09:30",
    "status": "scheduled",
    "reasonForVisit": "Regular checkup",
    "symptoms": ["Headache", "Dizziness"],
    "priority": "normal",
    "paymentStatus": "pending",
    "paymentAmount": 150,
    "createdAt": "2023-11-15T12:00:00.000Z"
  }
}
```

#### Auto-Schedule Appointments (Admin Only)

```
POST /api/appointments/auto-schedule
```

Request body:
```json
{
  "patientIds": ["60d0fe4f5311236168a109cd", "60d0fe4f5311236168a109cf"],
  "doctorIds": ["60d0fe4f5311236168a109cb"],
  "startDate": "2023-12-01",
  "endDate": "2023-12-07",
  "patientsInfo": [
    {
      "patientId": "60d0fe4f5311236168a109cd",
      "priority": "high",
      "reasonForVisit": "Chest pain"
    },
    {
      "patientId": "60d0fe4f5311236168a109cf",
      "priority": "normal",
      "reasonForVisit": "Regular checkup"
    }
  ]
}
```

Response:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "60d0fe4f5311236168a109ce",
      "doctor": "60d0fe4f5311236168a109cb",
      "patient": "60d0fe4f5311236168a109cd",
      "scheduledDate": "2023-12-01T00:00:00.000Z",
      "startTime": "09:00",
      "endTime": "09:30",
      "status": "scheduled",
      "reasonForVisit": "Chest pain",
      "priority": "high",
      "paymentStatus": "pending",
      "paymentAmount": 150
    },
    {
      "_id": "60d0fe4f5311236168a109d0",
      "doctor": "60d0fe4f5311236168a109cb",
      "patient": "60d0fe4f5311236168a109cf",
      "scheduledDate": "2023-12-01T00:00:00.000Z",
      "startTime": "09:30",
      "endTime": "10:00",
      "status": "scheduled",
      "reasonForVisit": "Regular checkup",
      "priority": "normal",
      "paymentStatus": "pending",
      "paymentAmount": 150
    }
  ]
}
```

## Frontend Integration Guide

### Authentication Flow

1. **Registration Process**:
   - Create a registration form with name, email, password, and optional role fields
   - Submit data to `/api/auth/register`
   - Store received token in secure storage
   - Redirect user to appropriate dashboard based on role

2. **Login Process**:
   - Create a login form with email and password fields
   - Submit data to `/api/auth/login`
   - Store received token in secure storage
   - Redirect user to appropriate dashboard based on role

3. **Authentication State Management**:
   - Create an authentication context/store
   - Persist token in localStorage/cookies
   - Add axios/fetch interceptors to include the token in all requests:
     ```javascript
     // Example with axios
     axios.interceptors.request.use(
       (config) => {
         const token = localStorage.getItem('token');
         if (token) {
           config.headers.Authorization = `Bearer ${token}`;
         }
         return config;
       },
       (error) => Promise.reject(error)
     );
     ```

4. **Protected Routes**:
   - Create a higher-order component or route guard for protected routes
   - Redirect unauthenticated users to login page
   - Redirect users to role-appropriate pages

### User Roles and Permissions

- **Admin**: Full access to all resources
- **Doctor**: Access to own profile, patients, and appointments
- **Patient**: Access to own profile and appointments
- **Staff**: Limited access based on assigned duties

### Frontend Architecture

#### Suggested Page Structure

1. **Public Pages**:
   - Home page with information about the facility
   - Doctor directory with search and filter options
   - Contact information
   - About page
   - Login/Register pages

2. **Patient Dashboard**:
   - Patient profile management
   - Book appointments
     - Doctor selection
     - Date/time slot selection
     - Reason for visit input
   - View/cancel upcoming appointments
   - View appointment history
   - Medical records
   - Prescription history

3. **Doctor Dashboard**:
   - Doctor profile management
   - Availability schedule management
   - View upcoming appointments
   - Patient list
   - View patient medical records
   - Update appointment details
     - Diagnosis
     - Prescription
     - Notes
     - Follow-up scheduling

4. **Admin Dashboard**:
   - User management (create, update, delete)
   - Doctor management
   - Patient management
   - Appointment management
   - Auto-scheduling interface
   - System statistics and reporting

#### Component Architecture

1. **Layout Components**:
   - Navbar/Header (with conditional rendering based on auth state)
   - Sidebar (with role-based navigation)
   - Footer
   - Container layouts

2. **Auth Components**:
   - Registration form
   - Login form
   - Password reset form
   - Protected route wrapper

3. **User Interface Components**:
   - Doctor card/list item
   - Patient card/list item
   - Appointment card/list item
   - Calendar/scheduler
   - Time slot picker
   - Search filters
   - Pagination component
   - Modal dialogs

4. **Form Components**:
   - Doctor profile form
   - Patient profile form
   - Appointment booking form
   - Medical record entry form
   - Prescription form

### Scheduling Algorithm UI

The backend implements a greedy scheduling algorithm. Create a user-friendly interface to use this feature:

1. **Auto-Schedule Interface**:
   - Selectable list of patients (with checkboxes)
   - Selectable list of doctors (with checkboxes)
   - Date range picker (start date - end date)
   - Priority assignment for each patient
   - Reason for visit input
   - Submit button
   - Results view showing successfully scheduled appointments

### Error Handling

The API returns consistent error responses. Implement appropriate error handling:

1. **API Error Handling**:
   - Create a global error handler for API requests
   - Display meaningful error messages to users
   - Add retry mechanisms for network errors
   - Redirect to login page for authentication errors

2. **Form Validation**:
   - Client-side validation before submission
   - Display API validation errors next to relevant form fields
   - Prevent form submission until all required fields are valid

3. **User Feedback**:
   - Success/error toast notifications
   - Loading indicators
   - Disable buttons during form submission

## Design Guidelines

### Color Scheme

- **Primary**: #1976D2 (Blue)
- **Secondary**: #424242 (Dark Grey)
- **Success**: #4CAF50 (Green)
- **Warning**: #FFC107 (Amber)
- **Error**: #F44336 (Red)
- **Background**: #F5F5F5 (Light Grey)
- **Text**: #212121 (Near Black)

### Typography

- **Headings**: Poppins or Roboto
- **Body**: Open Sans or Roboto
- **Font Sizes**:
  - Heading 1: 32px
  - Heading 2: 24px
  - Heading 3: 18px
  - Body: 16px
  - Small: 14px

### UI Components

- Use Material Design or custom components with consistent styling
- Responsive design for all screen sizes
- Accessibility compliance (WCAG 2.1)

## Performance Considerations

- Implement pagination for listing endpoints
- Use caching where appropriate (React Query, SWR, etc.)
- Optimize data fetching by using query parameters
- Consider implementing WebSockets for real-time updates
- Lazy loading of components and routes
- Code splitting for bundle size reduction

## Security Recommendations

- Never store JWT tokens in localStorage for production (use HttpOnly cookies)
- Implement proper CSRF protection
- Validate all user inputs
- Use HTTPS in production
- Sanitize user-generated content before display
- Implement rate limiting for sensitive endpoints
- Use environment variables for sensitive configuration

## Testing Strategy

- Unit tests for UI components
- Integration tests for API interactions
- End-to-end tests for critical workflows
- Accessibility testing
- Cross-browser testing

## Deployment Considerations

1. **Development Environment**:
   - Local development server
   - Proxy API requests to backend

2. **Production Build**:
   - Optimized bundle with minification
   - Environment-specific configuration
   - Static file hosting (Netlify, Vercel, AWS S3, etc.)

3. **CI/CD Pipeline**:
   - Automated testing
   - Build validation
   - Deployment to staging/production

## Support

For any questions or issues related to the backend API integration, please contact the backend team.

Happy coding! 