import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const TeacherLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine dynamic title and subtitle from pathname
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/teacher/dashboard':
        return {
          title: 'Teacher & Admin Dashboard',
          subtitle: 'Welcome to your smart attendance & geofencing command center'
        };
      case '/teacher/generate-qr':
        return {
          title: 'Generate Attendance QR',
          subtitle: 'Launch a secure dynamic QR code with GPS classroom geofence protection'
        };
      case '/teacher/attendance':
        return {
          title: 'Live Attendance Register',
          subtitle: 'Real-time student check-ins with physical location audits'
        };
      case '/teacher/classrooms':
        return {
          title: 'Classroom Location & Geofencing',
          subtitle: 'Register GPS coordinates and configure permitted proximity radius'
        };
      case '/teacher/reports':
        return {
          title: 'Reports & Analytics',
          subtitle: 'Attendance performance insights, defaulter lists, and compliance audits'
        };
      default:
        return {
          title: 'SmartAttend Portal',
          subtitle: 'Attendance & Geofencing Management'
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="main-content">
        <Header 
          title={title} 
          subtitle={subtitle} 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="page-body">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
