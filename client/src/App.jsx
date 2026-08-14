import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';

// Public
import Home from './pages/public/Home.jsx';
import About from './pages/public/About.jsx';
import Courses from './pages/public/Courses.jsx';
import CourseDetail from './pages/public/CourseDetail.jsx';
import Departments from './pages/public/Departments.jsx';
import Placements from './pages/public/Placements.jsx';
import Admissions from './pages/public/Admissions.jsx';
import Contact from './pages/public/Contact.jsx';

// Auth
import Login from './pages/auth/Login.jsx';
import StudentLogin from './pages/auth/StudentLogin.jsx';

// Admin
import AdminLayout from './layouts/AdminLayout.jsx';
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminStudents from './pages/admin/Students.jsx';
import AdminStudentProfile from './pages/admin/StudentProfile.jsx';
import AdminFaculty from './pages/admin/Faculty.jsx';
import AdminAttendance from './pages/admin/Attendance.jsx';
import AdminFees from './pages/admin/Fees.jsx';
import AdminCourses from './pages/admin/Courses.jsx';
import AdminClasses from './pages/admin/Classes.jsx';
import AdminSalaries from './pages/admin/Salaries.jsx';
import AdminStaffAttendance from './pages/admin/StaffAttendance.jsx';
import AdminNotices from './pages/admin/Notices.jsx';
import AdminEvents from './pages/admin/Events.jsx';
import AdminExams from './pages/admin/Exams.jsx';
import AdminApplications from './pages/admin/Applications.jsx';
import AdminPlacements from './pages/admin/Placements.jsx';
import AdminAdmissions from './pages/admin/Admissions.jsx';
import AdminSettings from './pages/admin/Settings.jsx';
import AdminLoginActivity from './pages/admin/LoginActivity.jsx';
import AdminAttendanceRequests from './pages/admin/AttendanceRequests.jsx';

// Faculty
import FacultyLayout from './layouts/FacultyLayout.jsx';
import FacultyPanel from './pages/faculty/FacultyPanel.jsx';

// Student
import StudentLayout from './layouts/StudentLayout.jsx';
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentProfile from './pages/student/Profile.jsx';
import StudentAttendance from './pages/student/Attendance.jsx';
import StudentResults from './pages/student/Results.jsx';
import StudentTests from './pages/student/Tests.jsx';
import StudentProfessors from './pages/student/Professors.jsx';
import StudentDetailedResult from './pages/student/DetailedResult.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '2rem', color: '#2563eb' }}></i></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/placements" element={<Placements />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/contact" element={<Contact />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/student-login" element={<StudentLogin />} />

          {/* Admin */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="students/:id" element={<AdminStudentProfile />} />
            <Route path="faculty" element={<AdminFaculty />} />
            <Route path="attendance" element={<AdminAttendance />} />
            <Route path="fees" element={<AdminFees />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="classes" element={<AdminClasses />} />
            <Route path="salaries" element={<AdminSalaries />} />
            <Route path="staff-attendance" element={<AdminStaffAttendance />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="exams" element={<AdminExams />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="placements" element={<AdminPlacements />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="attendance-requests" element={<AdminAttendanceRequests />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="login-activity" element={<AdminLoginActivity />} />
          </Route>

          {/* Faculty */}
          <Route path="/faculty" element={<ProtectedRoute roles={['admin', 'class_teacher', 'teacher']}><FacultyLayout /></ProtectedRoute>}>
            <Route index element={<FacultyPanel />} />
          </Route>

          {/* Student */}
          <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="detailed-result" element={<StudentDetailedResult />} />
            <Route path="tests" element={<StudentTests />} />
            <Route path="professors" element={<StudentProfessors />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
