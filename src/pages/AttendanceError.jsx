import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AlertOctagon, 
  Clock, 
  ShieldAlert, 
  UserCheck, 
  RotateCcw, 
  ArrowLeft,
  Navigation,
  MapPin,
  Compass,
  Radio,
  CheckCircle2
} from 'lucide-react';

const AttendanceError = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    reason, 
    message, 
    token, 
    distanceMeters, 
    allowedRadius, 
    accuracy, 
    classroomName 
  } = location.state || {
    reason: 'EXPIRED',
    message: 'Sorry, this QR code has expired.'
  };

  // Determine error style and iconography based on reason
  let errorTitle = 'Attendance Failed';
  let errorDescription = message || 'An error occurred while marking your attendance.';
  let Icon = AlertOctagon;
  let iconBg = 'var(--danger-bg)';
  let iconColor = 'var(--danger)';

  if (reason === 'OUT_OF_BOUNDS') {
    errorTitle = 'Outside Classroom Area';
    errorDescription = `Attendance rejected: You are ${distanceMeters || 'further than allowed'} meters away from ${classroomName || 'the assigned classroom'}. Attendance is restricted to within ${allowedRadius || 20}m of the classroom.`;
    Icon = MapPin;
    iconBg = '#FEF2F2';
    iconColor = '#EF4444';
  } else if (reason === 'POOR_GPS_ACCURACY') {
    errorTitle = 'Weak GPS Accuracy';
    errorDescription = message || `Your device GPS accuracy is too poor (±${accuracy || 80}m) to verify physical room presence. Please step near a window or open area and try again.`;
    Icon = Radio;
    iconBg = '#FFFBEB';
    iconColor = '#D97706';
  } else if (reason === 'LOCATION_DENIED' || reason === 'NO_LOCATION') {
    errorTitle = 'Location Permission Required';
    errorDescription = 'Location permission is strictly required to verify physical attendance inside the classroom and prevent proxy attendance.';
    Icon = Navigation;
    iconBg = '#FFFBEB';
    iconColor = '#D97706';
  } else if (reason === 'EXPIRED') {
    errorTitle = 'QR Code Expired';
    errorDescription = 'Sorry, this QR code has expired. Please ask your faculty to generate a new active QR code.';
    Icon = Clock;
    iconBg = '#FEF3C7';
    iconColor = '#D97706';
  } else if (reason === 'ALREADY_MARKED') {
    errorTitle = 'Already Marked';
    errorDescription = 'Attendance has already been recorded for your PRN in this lecture session.';
    Icon = UserCheck;
    iconBg = '#EEF2FF';
    iconColor = '#4F46E5';
  } else if (reason === 'INVALID') {
    errorTitle = 'Invalid QR Code';
    errorDescription = 'This QR code or token is not recognized as a valid active lecture session.';
    Icon = ShieldAlert;
    iconBg = 'var(--danger-bg)';
    iconColor = 'var(--danger)';
  }

  return (
    <div className="student-portal-wrapper animate-fade-in">
      <div className="student-portal-container">
        <div className="student-card" style={{ padding: '36px 24px' }}>
          {/* Error Icon */}
          <div 
            style={{
              width: '76px',
              height: '76px',
              borderRadius: '50%',
              background: iconBg,
              color: iconColor,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px'
            }}
          >
            <Icon size={40} />
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
            {errorTitle}
          </h2>

          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px', lineHeight: 1.5 }}>
            {errorDescription}
          </p>

          {/* Location Verification Metrics Pill (if out of bounds) */}
          {reason === 'OUT_OF_BOUNDS' && distanceMeters && (
            <div 
              style={{
                background: 'var(--danger-bg)',
                border: '1px solid var(--danger-border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                marginBottom: '24px',
                textAlign: 'left',
                fontSize: '12px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Classroom Target:</span>
                <strong style={{ color: 'var(--text-main)' }}>{classroomName}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Calculated Distance:</span>
                <strong style={{ color: 'var(--danger)' }}>{distanceMeters} meters away</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Permitted Radius:</span>
                <strong>{allowedRadius} meters</strong>
              </div>
            </div>
          )}

          {/* Token information badge */}
          {token && (
            <div 
              style={{
                background: 'var(--bg-main)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                marginBottom: '24px',
                fontSize: '12px',
                color: 'var(--text-muted)'
              }}
            >
              <span>Session Reference: </span>
              <code style={{ fontWeight: 700, color: 'var(--text-main)' }}>{token}</code>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {reason === 'OUT_OF_BOUNDS' && (
              <button 
                onClick={() => navigate(`/student/details?token=${encodeURIComponent(token || '')}&demo=valid`)}
                className="btn btn-block btn-lg"
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', 
                  color: '#FFFFFF', 
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)'
                }}
              >
                <CheckCircle2 size={18} />
                <span>Mark Attendance in Demo Mode (Inside Class)</span>
              </button>
            )}

            <button 
              onClick={() => navigate(`/student/details?token=${encodeURIComponent(token || '')}`)}
              className="btn btn-primary btn-block btn-lg"
            >
              <RotateCcw size={18} />
              <span>Retry Location & Verification</span>
            </button>

            <button 
              onClick={() => navigate('/student/scan')}
              className="btn btn-secondary btn-block"
            >
              <ArrowLeft size={16} />
              <span>Scan Different QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceError;
