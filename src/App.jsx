import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AttendanceProvider } from './context/AttendanceContext';
import ProtectedRoute from './components/ProtectedRoute';
import TeacherLayout from './components/TeacherLayout';

// Teacher & Admin Pages
import TeacherLogin from './pages/TeacherLogin';
import TeacherDashboard from './pages/TeacherDashboard';
import GenerateQR from './pages/GenerateQR';
import Attendance from './pages/Attendance';
import ClassroomManagement from './pages/ClassroomManagement';
import Reports from './pages/Reports';

// Student Pages
import StudentScan from './pages/StudentScan';
import StudentDetails from './pages/StudentDetails';
import AttendanceSuccess from './pages/AttendanceSuccess';
import AttendanceError from './pages/AttendanceError';

// 404
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <AttendanceProvider>
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />

          {/* Teacher Login (Public) */}
          <Route path="/teacher/login" element={<TeacherLogin />} />

          {/* Protected Teacher / Admin Views */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/dashboard" replace />} />
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="generate-qr" element={<GenerateQR />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="classrooms" element={<ClassroomManagement />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          {/* Student Portal Views (Public) */}
          <Route path="/student/scan" element={<StudentScan />} />
          <Route path="/student/details" element={<StudentDetails />} />
          <Route path="/student/success" element={<AttendanceSuccess />} />
          <Route path="/student/error" element={<AttendanceError />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AttendanceProvider>
    </AuthProvider>
  );
}

export default App;
