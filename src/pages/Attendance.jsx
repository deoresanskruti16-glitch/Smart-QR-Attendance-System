import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  UserCheck, 
  Play, 
  QrCode,
  ArrowRight,
  TrendingUp,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import AttendanceTable from '../components/AttendanceTable';
import StatusBadge from '../components/StatusBadge';
import { useAttendance } from '../context/AttendanceContext';
import { useNavigate } from 'react-router-dom';

const Attendance = () => {
  const navigate = useNavigate();
  const { activeSession, attendanceRecords, sessions } = useAttendance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pick target session (activeSession or most recent session)
  const currentSession = activeSession || sessions[0] || {
    subject: 'Computer System Fundamental',
    className: 'S.Y',
    division: 'DS-A',
    classroomId: 'CR-204',
    classroomName: 'Room 204 - Data Science Lab',
    date: new Date().toISOString().split('T')[0],
    time: '12:00 PM',
    status: 'Active',
    totalStudents: 4
  };

  const presentCount = attendanceRecords.length;
  const totalCount = currentSession.totalStudents || 4;
  const percentage = Math.min(100, Math.round((presentCount / totalCount) * 100));

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Live Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Real-time student check-ins with GPS classroom geofence verification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/teacher/classrooms')} 
            className="btn btn-secondary btn-sm"
          >
            <MapPin size={15} color="var(--primary)" />
            <span>Classroom Geofences</span>
          </button>

          <button 
            onClick={() => navigate('/teacher/generate-qr')} 
            className="btn btn-outline-primary btn-sm"
          >
            <QrCode size={15} />
            <span>Manage QR Code</span>
          </button>
        </div>
      </div>

      {/* Session Live Status Card */}
      <div 
        className="card" 
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%)',
          color: '#FFFFFF',
          padding: '24px 28px',
          marginBottom: '28px',
          borderRadius: 'var(--radius-xl)'
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#A5B4FC', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Currently Monitoring Session
              </span>
              <StatusBadge status={currentSession.status || (currentSession.isActive ? 'Active' : 'Completed')} />
            </div>

            <h1 style={{ fontSize: '26px', color: '#FFFFFF', fontWeight: 800, marginBottom: '8px' }}>
              {currentSession.subject}
            </h1>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#E0E7FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} color="#A5B4FC" />
                <span>Class: <strong>{currentSession.className}</strong> (Div {currentSession.division})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} color="#A5B4FC" />
                <span>Date: <strong>{currentSession.date}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={15} color="#A5B4FC" />
                <span>Time: <strong>{currentSession.time || currentSession.startTime}</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FDE047', fontWeight: 700 }}>
                <MapPin size={15} />
                <span>Room: {currentSession.classroomName || 'Room 204 - Data Science Lab'}</span>
              </div>
            </div>
          </div>

          {/* Present Count Pill & Gauge */}
          <div 
            style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px 24px',
              minWidth: '220px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '12px', color: '#C7D2FE', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 700, marginBottom: '4px' }}>
              Present Students
            </div>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 800, color: '#10B981', letterSpacing: '-0.5px' }}>
              Present: {presentCount} / {totalCount}
            </div>

            {/* Progress bar */}
            <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
              <div 
                style={{
                  width: `${percentage}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, #10B981, #34D399)',
                  borderRadius: '4px',
                  transition: 'width 0.4s ease'
                }} 
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#E0E7FF', marginTop: '4px' }}>
              <span>Attendance Rate</span>
              <strong style={{ color: '#34D399' }}>{percentage}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Table Component */}
      <AttendanceTable 
        records={attendanceRecords}
        onRefresh={handleRefresh}
        isLoading={isRefreshing}
        title="Live Logged Attendees"
      />
    </div>
  );
};

export default Attendance;
