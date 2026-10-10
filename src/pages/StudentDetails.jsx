import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  User, 
  Hash, 
  BookOpen, 
  Layers, 
  CheckCircle, 
  ArrowLeft, 
  AlertCircle,
  School,
  Sparkles,
  Send,
  Navigation,
  MapPin,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Compass,
  AlertTriangle
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { MOCK_DOMAINS, MOCK_DIVISIONS } from '../data/mockData';
import { calculateHaversineDistance, offsetCoordinates } from '../utils/geoUtils';

const StudentDetails = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'DEMO_CSF_02';
  const demoParam = searchParams.get('demo');

  // Parse session metadata if passed in URL from dynamic QR
  const sessionMeta = {
    token,
    subject: searchParams.get('subject'),
    className: searchParams.get('className'),
    division: searchParams.get('division'),
    classroomId: searchParams.get('classroomId'),
    classroomName: searchParams.get('classroomName'),
    lat: searchParams.get('lat'),
    lon: searchParams.get('lon'),
    radius: searchParams.get('radius'),
    expiresAt: searchParams.get('expiresAt')
  };

  const { markAttendance, activeSession, sessions, getClassroomById } = useAttendance();

  // Find target session
  let targetSession = (activeSession && activeSession.token === token)
    ? activeSession
    : sessions.find(s => s.token === token);

  if (!targetSession && sessionMeta.subject) {
    targetSession = {
      id: `SES-QR`,
      token: token,
      subject: sessionMeta.subject,
      className: sessionMeta.className || 'S.Y',
      division: sessionMeta.division || 'DS-A',
      classroomId: sessionMeta.classroomId || 'CR-204',
      classroomName: sessionMeta.classroomName || 'Room 204 - Data Science Lab',
      latitude: sessionMeta.lat ? Number(sessionMeta.lat) : 21.3115,
      longitude: sessionMeta.lon ? Number(sessionMeta.lon) : 74.8812,
      radiusMeters: sessionMeta.radius ? Number(sessionMeta.radius) : 20,
      expiresAt: sessionMeta.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      isActive: true
    };
  } else if (!targetSession) {
    targetSession = activeSession;
  }

  const baseClassroom = targetSession?.classroomId 
    ? getClassroomById(targetSession.classroomId)
    : getClassroomById('CR-204');

  const targetClassroom = {
    ...baseClassroom,
    id: sessionMeta.classroomId || baseClassroom?.id || 'CR-204',
    name: sessionMeta.classroomName || baseClassroom?.name || 'Room 204 - Data Science Lab',
    latitude: sessionMeta.lat ? Number(sessionMeta.lat) : (baseClassroom?.latitude ?? 21.3115),
    longitude: sessionMeta.lon ? Number(sessionMeta.lon) : (baseClassroom?.longitude ?? 74.8812),
    radiusMeters: sessionMeta.radius ? Number(sessionMeta.radius) : (baseClassroom?.radiusMeters ?? 20),
    maxAccuracyAllowed: baseClassroom?.maxAccuracyAllowed ?? 50
  };

  const [formData, setFormData] = useState({
    prn: '251106012',
    name: 'Krutadnya Pradip Bhadane',
    domain: 'CSE(Data Science)',
    division: 'DS-A'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // GPS Location State
  // Status: 'IDLE' | 'LOCATING' | 'ACQUIRED' | 'DENIED' | 'TIMEOUT' | 'ERROR'
  const [gpsStatus, setGpsStatus] = useState('LOCATING');
  const [gpsMessage, setGpsMessage] = useState('Acquiring your current GPS location...');
  const [locationData, setLocationData] = useState(null);
  const [locationMode, setLocationMode] = useState(() => demoParam === 'valid' ? 'sim_valid' : 'device'); // 'device' | 'sim_valid' | 'sim_outside' | 'sim_poor_acc'

  // Fetch real device GPS coordinates
  const acquireDeviceLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('ERROR');
      setGpsMessage('Geolocation is not supported on your device/browser.');
      return;
    }

    setGpsStatus('LOCATING');
    setGpsMessage('Acquiring high-accuracy GPS fix from device sensors...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy),
          timestamp: position.timestamp,
          source: 'device'
        };
        setLocationData(coords);
        setGpsStatus('ACQUIRED');
        setGpsMessage(`GPS Fix Acquired (Accuracy: ±${coords.accuracy}m)`);
      },
      (error) => {
        let msg = 'Unable to acquire location.';
        let status = 'ERROR';
        if (error.code === error.PERMISSION_DENIED) {
          status = 'DENIED';
          msg = 'Location permission denied. Please allow location access in browser settings to mark attendance.';
        } else if (error.code === error.TIMEOUT) {
          status = 'TIMEOUT';
          msg = 'GPS acquisition timed out. Please retry.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          status = 'ERROR';
          msg = 'GPS position unavailable. Please ensure location services are enabled.';
        }
        setGpsStatus(status);
        setGpsMessage(msg);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  }, []);

  // Initialize location on mount or when mode changes
  useEffect(() => {
    if (locationMode === 'device') {
      acquireDeviceLocation();
    } else if (locationMode === 'sim_valid') {
      // Offset by 4.5m from classroom (well inside geofence)
      const room = targetClassroom || { latitude: 21.311500, longitude: 74.881200 };
      const point = offsetCoordinates(room.latitude, room.longitude, 4.5, 45);
      setLocationData({
        latitude: point.latitude,
        longitude: point.longitude,
        accuracy: 8,
        source: 'sim_valid'
      });
      setGpsStatus('ACQUIRED');
      setGpsMessage('Simulated Inside Classroom (4.5m away • ±8m accuracy)');
    } else if (locationMode === 'sim_outside') {
      // Offset by 135m from classroom (outside in canteen/hostel)
      const room = targetClassroom || { latitude: 21.311500, longitude: 74.881200 };
      const point = offsetCoordinates(room.latitude, room.longitude, 135, 180);
      setLocationData({
        latitude: point.latitude,
        longitude: point.longitude,
        accuracy: 14,
        source: 'sim_outside'
      });
      setGpsStatus('ACQUIRED');
      setGpsMessage('Simulated Outside Classroom (135m away in Canteen • ±14m accuracy)');
    } else if (locationMode === 'sim_poor_acc') {
      // Offset inside, but with very weak GPS accuracy (±95m)
      const room = targetClassroom || { latitude: 21.311500, longitude: 74.881200 };
      const point = offsetCoordinates(room.latitude, room.longitude, 10, 90);
      setLocationData({
        latitude: point.latitude,
        longitude: point.longitude,
        accuracy: 95,
        source: 'sim_poor_acc'
      });
      setGpsStatus('ACQUIRED');
      setGpsMessage('Simulated Weak GPS Signal (±95m accuracy • Exceeds threshold)');
    }
  }, [locationMode, targetClassroom, acquireDeviceLocation]);

  // Live estimated distance calculation
  let liveDistance = null;
  if (locationData && targetClassroom) {
    try {
      liveDistance = calculateHaversineDistance(
        locationData.latitude,
        locationData.longitude,
        targetClassroom.latitude,
        targetClassroom.longitude
      );
    } catch (e) {
      console.warn('Distance error:', e);
    }
  }

  // Validate form
  const validate = () => {
    const errs = {};
    if (!formData.prn.trim()) errs.prn = 'PRN is required (e.g., 251106012)';
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.domain) errs.domain = 'Domain is required';
    if (!formData.division) errs.division = 'Division is required';

    if (!locationData || gpsStatus === 'DENIED' || gpsStatus === 'ERROR' || gpsStatus === 'TIMEOUT') {
      errs.location = 'Valid GPS location is required. Please grant location permissions or select a simulation preset.';
    }
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    setTimeout(() => {
      const result = markAttendance({
        prn: formData.prn,
        name: formData.name,
        domain: formData.domain,
        division: formData.division,
        token: token,
        location: locationData,
        sessionMeta
      });

      setIsSubmitting(false);

      if (result.success) {
        navigate('/student/success', {
          state: {
            student: formData,
            record: result.record,
            session: result.session,
            geofence: result.geofence
          }
        });
      } else {
        navigate('/student/error', {
          state: {
            reason: result.reason,
            message: result.message,
            token: token,
            distanceMeters: result.distanceMeters,
            allowedRadius: result.allowedRadius,
            accuracy: result.accuracy,
            classroomName: result.classroomName || targetClassroom?.name
          }
        });
      }
    }, 500);
  };

  // Sample student profiles for 1-click test
  const quickFillStudent = (prn, name, domain, div) => {
    setFormData({ prn, name, domain, division: div });
    setErrors({});
  };

  return (
    <div className="student-portal-wrapper animate-fade-in">
      <div className="student-portal-container">
        {/* Brand Header */}
        <div className="student-brand-header">
          <div className="student-brand-logo">
            <School size={28} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
            <span>R.C.Patel Institute of Technology, Shirpur</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
            Student Attendance Verification
          </h1>
        </div>

        {/* Card Form */}
        <div className="student-card" style={{ textAlign: 'left' }}>
          
          {/* Active Session & Assigned Classroom Pill */}
          <div 
            style={{
              background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 16px',
              color: '#FFFFFF',
              marginBottom: '20px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#A5B4FC', letterSpacing: '0.6px' }}>
                QR Session Verified
              </div>
              <span style={{ fontSize: '11px', background: 'rgba(16, 185, 129, 0.3)', color: '#6EE7B7', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                GPS Geofenced
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: '15px', color: '#FFFFFF', marginTop: '2px' }}>
              {targetSession ? targetSession.subject : 'Computer System Fundamental'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#FDE047', marginTop: '6px', fontWeight: 600 }}>
              <MapPin size={14} />
              <span>Target Room: {targetClassroom?.name || 'Room 204 - Data Science Lab'}</span>
            </div>
            <div style={{ fontSize: '11px', color: '#C7D2FE', marginTop: '2px' }}>
              Permitted Radius: <strong>{targetClassroom?.radiusMeters || 20} meters</strong> • Token: <code>{token}</code>
            </div>
          </div>

          {/* GPS Location Verification Card */}
          <div 
            style={{
              background: gpsStatus === 'ACQUIRED' ? 'var(--bg-main)' : gpsStatus === 'LOCATING' ? 'var(--primary-light)' : 'var(--danger-bg)',
              border: `1px solid ${gpsStatus === 'ACQUIRED' ? 'var(--border-light)' : gpsStatus === 'LOCATING' ? 'var(--primary)' : 'var(--danger-border)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginBottom: '22px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Navigation 
                  size={16} 
                  color={gpsStatus === 'ACQUIRED' ? 'var(--primary)' : gpsStatus === 'LOCATING' ? 'var(--primary)' : 'var(--danger)'}
                  className={gpsStatus === 'LOCATING' ? 'animate-spin' : ''} 
                />
                <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-main)' }}>
                  GPS Location Status
                </span>
              </div>

              <button 
                type="button" 
                onClick={acquireDeviceLocation}
                className="btn btn-secondary btn-sm"
                style={{ padding: '3px 8px', fontSize: '11px' }}
                title="Refresh GPS Fix"
              >
                <RefreshCw size={12} className={gpsStatus === 'LOCATING' ? 'animate-spin' : ''} />
                <span>Retry Fix</span>
              </button>
            </div>

            <div style={{ fontSize: '12px', color: gpsStatus === 'ACQUIRED' ? 'var(--text-main)' : 'var(--text-muted)', marginBottom: '8px' }}>
              {gpsMessage}
            </div>

            {locationData && (
              <div 
                style={{
                  background: '#FFFFFF',
                  borderRadius: 'var(--radius-md)',
                  padding: '8px 12px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-light)'
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Coordinates: </span>
                  <code style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {locationData.latitude.toFixed(5)}°, {locationData.longitude.toFixed(5)}°
                  </code>
                </div>
                {liveDistance !== null && (
                  <div style={{ fontWeight: 700, color: liveDistance <= (targetClassroom?.radiusMeters || 20) ? 'var(--success-text)' : 'var(--danger-text)' }}>
                    Distance: {liveDistance}m
                  </div>
                )}
              </div>
            )}

            {locationMode === 'device' && liveDistance !== null && liveDistance > (targetClassroom?.radiusMeters || 20) && (
              <div 
                style={{
                  marginTop: '10px',
                  background: 'var(--warning-bg)',
                  border: '1px solid var(--warning-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  fontSize: '12px',
                  color: 'var(--warning-text)'
                }}
              >
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <AlertTriangle size={15} color="#D97706" />
                  <span>Outside Classroom Boundary ({liveDistance}m away)</span>
                </div>
                <div style={{ fontSize: '11px', lineHeight: 1.4, marginBottom: '6px' }}>
                  Your real GPS is outside <strong>{targetClassroom.name}</strong>. If evaluating/testing outside college, click below to simulate in-class presence:
                </div>
                <button
                  type="button"
                  onClick={() => setLocationMode('sim_valid')}
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '4px 10px',
                    borderRadius: '4px',
                    background: '#10B981',
                    color: '#FFFFFF',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  🟢 Switch to Inside Class (Demo Mode)
                </button>
              </div>
            )}

            {errors.location && (
              <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '8px', fontWeight: 600 }}>
                {errors.location}
              </p>
            )}

            {/* GPS Simulation / Viva Testing Presets */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                GPS Source Mode (Test & Demo Scenarios):
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setLocationMode('sim_valid')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'left',
                    background: locationMode === 'sim_valid' ? 'var(--success-bg)' : '#FFFFFF',
                    border: locationMode === 'sim_valid' ? '2px solid var(--success)' : '1px solid var(--border-light)',
                    color: locationMode === 'sim_valid' ? 'var(--success-text)' : 'var(--text-main)'
                  }}
                >
                  🟢 Inside Class (Valid)
                </button>

                <button
                  type="button"
                  onClick={() => setLocationMode('sim_outside')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'left',
                    background: locationMode === 'sim_outside' ? 'var(--danger-bg)' : '#FFFFFF',
                    border: locationMode === 'sim_outside' ? '2px solid var(--danger)' : '1px solid var(--border-light)',
                    color: locationMode === 'sim_outside' ? 'var(--danger-text)' : 'var(--text-main)'
                  }}
                >
                  🔴 In Canteen (Reject)
                </button>

                <button
                  type="button"
                  onClick={() => setLocationMode('sim_poor_acc')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'left',
                    background: locationMode === 'sim_poor_acc' ? 'var(--warning-bg)' : '#FFFFFF',
                    border: locationMode === 'sim_poor_acc' ? '2px solid var(--warning)' : '1px solid var(--border-light)',
                    color: locationMode === 'sim_poor_acc' ? 'var(--warning-text)' : 'var(--text-main)'
                  }}
                >
                  🟡 Weak GPS (±95m)
                </button>

                <button
                  type="button"
                  onClick={() => setLocationMode('device')}
                  style={{
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 600,
                    textAlign: 'left',
                    background: locationMode === 'device' ? 'var(--primary-light)' : '#FFFFFF',
                    border: locationMode === 'device' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    color: locationMode === 'device' ? 'var(--primary)' : 'var(--text-main)'
                  }}
                >
                  🔵 Live Device GPS
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* PRN Field */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                PRN (Permanent Registration No.) <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Hash size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  placeholder="e.g. 251106012"
                  value={formData.prn}
                  onChange={(e) => setFormData({ ...formData, prn: e.target.value })}
                  style={{ 
                    width: '100%', 
                    paddingLeft: '38px', 
                    height: '44px',
                    borderColor: errors.prn ? 'var(--danger)' : 'var(--border-light)' 
                  }}
                  required
                />
              </div>
              {errors.prn && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.prn}</p>}
            </div>

            {/* Student Name */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  placeholder="e.g. Krutadnya Pradip Bhadane"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ 
                    width: '100%', 
                    paddingLeft: '38px', 
                    height: '44px',
                    borderColor: errors.name ? 'var(--danger)' : 'var(--border-light)' 
                  }}
                  required
                />
              </div>
              {errors.name && <p style={{ color: 'var(--danger)', fontSize: '12px', marginTop: '4px' }}>{errors.name}</p>}
            </div>

            {/* Domain */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Department / Domain <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                style={{ width: '100%', height: '44px' }}
                required
              >
                {MOCK_DOMAINS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Division */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                Division <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <select
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                style={{ width: '100%', height: '44px' }}
                required
              >
                {MOCK_DIVISIONS.map(div => (
                  <option key={div} value={div}>Division {div}</option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isSubmitting || gpsStatus === 'LOCATING'}
              className="btn btn-primary btn-block btn-lg"
              style={{ marginBottom: '16px' }}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Verifying Classroom Location...' : 'Verify Location & Mark Attendance'}</span>
            </button>
          </form>

          {/* Quick Demo Autofills */}
          <div 
            style={{
              paddingTop: '16px',
              borderTop: '1px solid var(--border-light)',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <span style={{ fontWeight: 600 }}>Quick Classmate Profiles: </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              <button 
                type="button" 
                onClick={() => quickFillStudent('251106012', 'Krutadnya Pradip Bhadane', 'CSE(Data Science)', 'DS-A')}
                style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '3px 8px', borderRadius: '4px' }}
              >
                Krutadnya (251106012)
              </button>
              <button 
                type="button" 
                onClick={() => quickFillStudent('251106018', 'Bhumika Snehal Kothari', 'CSE(Data Science)', 'DS-A')}
                style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '3px 8px', borderRadius: '4px' }}
              >
                Bhumika (251106018)
              </button>
              <button 
                type="button" 
                onClick={() => quickFillStudent('251106050', 'Pranjal Rohidas Patil', 'CSE(Data Science)', 'DS-A')}
                style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '3px 8px', borderRadius: '4px' }}
              >
                Pranjal (251106050)
              </button>
              <button 
                type="button" 
                onClick={() => quickFillStudent('251106096', 'Sanskruti Lalit Deore', 'CSE(Data Science)', 'DS-A')}
                style={{ fontSize: '11px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', padding: '3px 8px', borderRadius: '4px' }}
              >
                Sanskruti (251106096)
              </button>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <button 
            onClick={() => navigate('/student/scan')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}
          >
            <ArrowLeft size={15} />
            <span>Scan Different QR</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetails;
