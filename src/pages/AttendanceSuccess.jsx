import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  User, 
  Hash, 
  BookOpen, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Check, 
  RotateCcw, 
  Sparkles,
  MapPin,
  Navigation
} from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

const AttendanceSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { student, record, session, geofence } = location.state || {};

  // Default fallback data if page is accessed directly
  const data = {
    name: student?.name || 'Krutadnya Pradip Bhadane',
    prn: student?.prn || '251106012',
    domain: student?.domain || 'CSE(Data Science)',
    division: student?.division || 'DS-A',
    subject: session?.subject || 'Computer System Fundamental',
    className: session?.className || 'S.Y',
    classroomName: record?.classroomName || session?.classroomName || 'Room 204 - Data Science Lab',
    distanceMeters: record?.distanceMeters ?? geofence?.distanceMeters ?? 4.5,
    gpsAccuracy: record?.gpsAccuracy ?? geofence?.accuracy ?? 8,
    date: record?.date || new Date().toISOString().split('T')[0],
    time: record?.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'Present'
  };

  useEffect(() => {
    // Fire celebratory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="student-portal-wrapper animate-fade-in">
      <div className="student-portal-container">
        <div className="student-card" style={{ padding: '36px 24px' }}>
          {/* Animated Success Badge */}
          <div 
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35)',
              marginBottom: '20px'
            }}
          >
            <CheckCircle2 size={44} />
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', background: 'var(--success-bg)', color: 'var(--success-text)', borderRadius: 'var(--radius-full)', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
            <Sparkles size={14} color="#10B981" />
            <span>GPS Geofence Verified & Recorded</span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            Attendance Marked Successfully!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
            Your physical presence inside the registered classroom has been verified.
          </p>

          {/* Receipt Details Box */}
          <div 
            style={{
              background: 'var(--bg-main)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '26px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Student Name</span>
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>{data.name}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>PRN</span>
              <code style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>{data.prn}</code>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Subject</span>
              <span style={{ fontWeight: 600, fontSize: '13px' }}>{data.subject}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Class & Division</span>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{data.className} (Div {data.division})</span>
            </div>

            {/* GPS Geofence Audit Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified Classroom</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)' }}>
                {data.classroomName}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Geofence Distance</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success-text)', background: 'var(--success-bg)', padding: '2px 8px', borderRadius: '4px' }}>
                {data.distanceMeters}m (GPS Accuracy: ±{data.gpsAccuracy}m)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Recorded Timestamp</span>
              <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>{data.date} at {data.time}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Attendance Status</span>
              <StatusBadge status="Present" />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => navigate('/student/scan')}
              className="btn btn-primary btn-block btn-lg"
            >
              <Check size={18} />
              <span>Done</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceSuccess;
