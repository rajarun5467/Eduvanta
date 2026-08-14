# EduNex College Management System - MERN Stack

A complete MERN (MongoDB, Express, React, Node.js) conversion of the EduNex college management system.

## Project Structure

```
educollege_website/
├── client/          # React frontend (Vite)
├── server/          # Node.js + Express backend
├── README.md
└── .gitignore
```

## Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)

## Setup & Run

### 1. Server

```bash
cd server
npm install
cp .env.example .env    # Edit values if needed
npm run seed            # Seed database with demo data
npm run dev             # Start server (port 5000)
```

### 2. Client

```bash
cd client
npm install
npm run dev             # Start frontend (port 5173)
```

### 3. Access

- **Website:** http://localhost:5173
- **Admin Login:** http://localhost:5173/login
- **Student Login:** http://localhost:5173/student-login

## Demo Credentials

| Role     | Username/Email          | Password       |
|----------|-------------------------|----------------|
| Admin    | admin                   | admin123       |
| Faculty  | rajesh                  | teacher123     |
| Student  | rahul@email.com         | 2003-05-15     |

## API Endpoints

```
/api/auth          - Authentication (login, student-login, logout, me)
/api/students      - Student CRUD + reset password, toggle status
/api/faculty       - Faculty CRUD + reset password, toggle status
/api/courses       - Course CRUD
/api/attendance    - Student attendance (mark, batch, calendar)
/api/staff-attendance - Faculty/staff attendance + calendar
/api/marks         - Marks management
/api/tests         - Test management
/api/classes       - Classes & sections
/api/fees          - Fee management
/api/salaries      - Salary management
/api/notices       - Notice board
/api/events        - Events
/api/exams         - Exam management
/api/results       - Results
/api/placements    - Placement records
/api/applications  - Admission applications
/api/admissions    - Admissions
/api/login-activity - Login activity monitoring
/api/corrections   - Attendance correction requests
/api/faculty-subjects - Faculty subject assignments
/api/class-subjects   - Class subject schedules
/api/dashboard     - Dashboard stats (admin, faculty, student)
```

## Features

- **Admin Panel:** Dashboard, Student/Faculty management, Attendance, Fees, Courses, Classes, Salaries, Staff Attendance, Notices, Events, Exams, Applications, Placements, Settings, Login Activity
- **Faculty Panel:** Dashboard, My Attendance Calendar, Subject Attendance, Marks, Tests, My Students, Subjects, Classes, Payslip, Notices
- **Student Portal:** Dashboard, Profile, Attendance Calendar, Results
- **Public Website:** Home, About, Courses, Course Detail, Departments, Placements, Admissions, Contact
- **Auth:** JWT-based with role-based access control (admin, class_teacher, teacher, student)
- **Attendance:** Working days calculation (excluding weekends), percentage calculation, monthly calendar view
