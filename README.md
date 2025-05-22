# Healthcare Scheduling System - Backend API Documentation

## Overview

This healthcare scheduling system provides a robust backend for managing doctors, patients, and appointments in a medical facility. It includes features such as user authentication, doctor and patient profile management, appointment scheduling, and an intelligent scheduling algorithm.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   cd backend
   npm install
   ```
3. Create `.env` file in the backend directory with the following variables:
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

#### Create Doctor

```
POST /api/doctors
```

Request body:
```json
{
  "user": "60d0fe4f5311236168a109cc",
  "specialization": "Cardiology",
  "qualifications": ["MD", "PhD"],
  "experience": 10,
  "licenseNumber": "MED12345",
  "fees": 150,
  "availableSlots": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "17:00",
      "slotDuration": 30,
      "maxPatients": 1
    }
  ],
  "contactInfo": {
    "phone": "123-456-7890",
    "address": "123 Medical Center, City"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cb",
    "user": "60d0fe4f5311236168a109cc",
    "specialization": "Cardiology",
    "qualifications": ["MD", "PhD"],
    "experience": 10,
    "licenseNumber": "MED12345",
    "fees": 150,
    "availableSlots": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "17:00",
        "slotDuration": 30,
        "maxPatients": 1
      }
    ],
    "contactInfo": {
      "phone": "123-456-7890",
      "address": "123 Medical Center, City"
    },
    "rating": 0,
    "reviews": [],
    "createdAt": "2023-11-15T12:00:00.000Z"
  }
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

#### Create Patient

```
POST /api/patients
```

Request body:
```json
{
  "user": "60d0fe4f5311236168a109ca",
  "dateOfBirth": "1990-01-01",
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
    "expiryDate": "2024-12-31"
  }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "_id": "60d0fe4f5311236168a109cd",
    "user": "60d0fe4f5311236168a109ca",
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
    "medicalHistory": [],
    "medications": [],
    "createdAt": "2023-11-15T12:00:00.000Z"
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

1. Implement register and login forms
2. Store the JWT token in localStorage or a secure cookie
3. Include the token in all API requests:
   ```javascript
   fetch('/api/some-endpoint', {
     headers: {
       'Authorization': `Bearer ${localStorage.getItem('token')}`,
       'Content-Type': 'application/json'
     }
   })
   ```
4. Create an authentication context or state to manage user information

### User Roles and Permissions

- **Admin**: Full access to all resources
- **Doctor**: Access to own profile, patients, and appointments
- **Patient**: Access to own profile and appointments
- **Staff**: Limited access based on assigned duties

### Suggested Pages

1. **Public Pages**:
   - Home page with information about the facility
   - Doctor directory 
   - Contact information
   - Login/Register pages

2. **Patient Dashboard**:
   - Patient profile management
   - Book appointments 
   - View/cancel upcoming appointments
   - View appointment history
   - Medical records
   - Prescription history

3. **Doctor Dashboard**:
   - Doctor profile management
   - View upcoming appointments
   - Patient management
   - Update appointment details (diagnosis, prescription, etc.)
   - Manage availability schedule

4. **Admin Dashboard**:
   - User management
   - Doctor/Patient registration
   - Appointment management
   - Scheduling system access
   - System statistics and reporting

### Scheduling Algorithm

The backend implements a greedy scheduling algorithm that:

1. Prioritizes patients based on emergency status and priority level
2. Considers doctor availability and specialization
3. Optimizes time slot allocation
4. Handles emergency cases with priority

Frontend interfaces for the auto-scheduling feature should:
1. Allow selection of patients to be scheduled
2. Allow selection of doctors available for the scheduling
3. Define a date range for scheduling
4. Provide options to set priority and reason for each patient
5. Display the results after scheduling

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Implement appropriate error handling and user feedback in the frontend.

## Performance Considerations

- Implement pagination for listing endpoints
- Use caching where appropriate
- Optimize data fetching by using query parameters
- Consider implementing WebSockets for real-time updates

## Security Recommendations

- Never store JWT tokens in localStorage for production (use HttpOnly cookies)
- Implement proper CSRF protection
- Validate all user inputs
- Use HTTPS in production
- Implement rate limiting for sensitive endpoints

## Support

For any questions or issues related to the backend API, please contact the backend team.

Happy coding! 