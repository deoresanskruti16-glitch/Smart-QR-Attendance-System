import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  CalendarDays, 
  UserCheck, 
  Percent, 
  QrCode, 
  ArrowRight, 
  Play, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  BookOpen,
  Sparkles,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { MOCK_ALL_STUDENTS } from '../data/mockData';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const { teacher } = useAuth();
  const { sessions, activeSession, attendanceRecords, classrooms } = useAttendance();

  // Compute live metrics
  const totalStudents = MOCK_ALL_STUDENTS.length; // classmates count
  const todaysSessionsCount = sessions.length;
  const presentToday = attendanceRecords.length;
  const activeClassroomsCount = classrooms.filter(c => c.status === 'Active').length;

  return (
    <div className="animate-fade-in">
      {/* Welcome Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '28px 32px',
          color: '#FFFFFF',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '20px',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 600, marginBottom: '10px' }}>
            <Sparkles size={14} color="#FDE047" />
            <span>R.C.Patel Institute of Technology • AY 2026-27</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            Welcome back, {teacher?.name || 'Prof. Yogesh Pathak'}!
          </h2>
          <p style={{ color: '#C7D2FE', fontSize: '14px', maxWidth: '580px' }}>
            Class: <strong style={{ color: '#FFF' }}>S.Y • CSE(Data Science) - Div DS-A</strong>. GPS Geofencing is <strong style={{ color: '#6EE7B7' }}>Active</strong> across {activeClassroomsCount} registered campus lecture halls.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/teacher/classrooms')}
            className="btn btn-secondary btn-lg"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.25)' }}
          >
            <MapPin size={18} />
            <span>Classroom Geofences</span>
          </button>

          <button 
            onClick={() => navigate('/teacher/generate-qr')}
            className="btn btn-gradient btn-lg"
            style={{ border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <QrCode size={18} />
            <span>Generate New QR</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="metrics-grid">
        <DashboardCard 
          title="Total Registered Students"
          value={totalStudents.toString()}
          subtitle="S.Y DS-A Roster"
          icon={Users}
          trend="100% Enrolled"
          trendDirection="up"
          color="#4F46E5"
          bgLight="#EEF2FF"
        />

        <DashboardCard 
          title="Today's Sessions"
          value={todaysSessionsCount.toString()}
          subtitle="4 Subjects Scheduled"
          icon={CalendarDays}
          trend="AY 2026-27"
          trendDirection="up"
          color="#06B6D4"
          bgLight="#ECFEFF"
        />

        <DashboardCard 
          title="Geo-Verified Attendees"
          value={presentToday.toString()}
          subtitle="Live Verified In-Class"
          icon={UserCheck}
          trend="100% Verified"
          trendDirection="up"
          color="#10B981"
          bgLight="#ECFDF5"
        />

        <DashboardCard 
          title="Active Geofenced Rooms"
          value={activeClassroomsCount.toString()}
          subtitle="GPS Protected Zones"
          icon={MapPin}
          trend="Anti-Proxy Active"
          trendDirection="up"
          color="#8B5CF6"
          bgLight="#F5F3FF"
        />
      </div>

      {/* Active Session Alert Banner (if any) */}
      {activeSession && activeSession.isActive && (
        <div 
          className="card"
          style={{
            background: 'linear-gradient(90deg, #ECFDF5 0%, #FFFFFF 100%)',
            border: '1px solid var(--success-border)',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-bg)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '15px' }}>Live QR Session Active: {activeSession.subject}</strong>
                <StatusBadge status="Active" />
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {activeSession.className} (Div {activeSession.division}) • Room: <strong style={{ color: 'var(--primary)' }}>{activeSession.classroomName || 'Room 204 - Data Science Lab'}</strong> • Token: <code style={{ color: 'var(--primary)', fontWeight: 600 }}>{activeSession.token}</code>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => navigate('/teacher/generate-qr')}
              className="btn btn-secondary btn-sm"
            >
              <span>View QR Code</span>
            </button>
            <button 
              onClick={() => navigate('/teacher/attendance')}
              className="btn btn-primary btn-sm"
            >
              <span>Live Attendance Table</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Today's Sessions Table */}
      <div className="custom-table-container" style={{ marginBottom: '28px' }}>
        <div 
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Today's Scheduled Sessions</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Manage today's lectures, launch dynamic QR codes, or review logged attendance
            </p>
          </div>

          <button 
            onClick={() => navigate('/teacher/generate-qr')}
            className="btn btn-primary btn-sm"
          >
            <QrCode size={14} />
            <span>Generate QR</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Class</th>
                <th>Assigned Classroom</th>
                <th>Scheduled Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((ses) => (
                <tr key={ses.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {ses.subject}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {ses.id}</div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{ses.className}</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block' }}>Div {ses.division}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <MapPin size={14} color="var(--primary)" />
                      <span>{ses.classroomName ? ses.classroomName.split('-')[0].trim() : 'Room 204'}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>GPS Geofenced</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                      <Clock size={14} />
                      <span>{ses.time}</span>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={ses.status} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {ses.status === 'Active' ? (
                        <button 
                          onClick={() => navigate('/teacher/attendance')}
                          className="btn btn-primary btn-sm"
                        >
                          <Play size={12} fill="#FFF" />
                          <span>Monitor Live</span>
                        </button>
                      ) : ses.status === 'Upcoming' ? (
                        <button 
                          onClick={() => navigate('/teacher/generate-qr')}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <QrCode size={12} />
                          <span>Start QR</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => navigate('/teacher/attendance')}
                          className="btn btn-secondary btn-sm"
                        >
                          <span>View Logs</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
