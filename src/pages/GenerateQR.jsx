import React, { useState } from 'react';
import { 
  QrCode, 
  Clock, 
  Calendar, 
  BookOpen, 
  Layers, 
  Sparkles, 
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Building2,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import QRDisplay from '../components/QRDisplay';
import { useAttendance } from '../context/AttendanceContext';
import { MOCK_CLASSES, MOCK_SUBJECTS, MOCK_DIVISIONS } from '../data/mockData';
import { Link } from 'react-router-dom';

const GenerateQR = () => {
  const { activeSession, createSession, expireSession, classrooms } = useAttendance();

  const [formData, setFormData] = useState({
    className: 'S.Y',
    subject: 'Computer System Fundamental',
    division: 'DS-A',
    classroomId: classrooms[0]?.id || 'CR-204',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    validityMinutes: 5
  });

  const [showQR, setShowQR] = useState(() => !!activeSession);

  const selectedClassroom = classrooms.find(c => c.id === formData.classroomId) || classrooms[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    createSession({
      className: formData.className,
      subject: formData.subject,
      division: formData.division,
      classroomId: formData.classroomId,
      date: formData.date,
      startTime: formData.startTime,
      validityMinutes: Number(formData.validityMinutes)
    });
    setShowQR(true);
  };

  const handleGenerateNew = () => {
    setShowQR(false);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Top Header info */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Generate Attendance QR</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          Create a time-bounded dynamic QR session with GPS classroom geofence protection.
        </p>
      </div>

      {showQR && activeSession ? (
        <div>
          <QRDisplay 
            session={activeSession}
            onGenerateNew={handleGenerateNew}
            onExpire={expireSession}
          />
        </div>
      ) : (
        <div 
          className="card"
          style={{
            maxWidth: '720px',
            margin: '0 auto',
            padding: '32px',
            borderRadius: 'var(--radius-xl)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              
              {/* Class */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Target Class
                </label>
                <select
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                  required
                >
                  {MOCK_CLASSES.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              {/* Division */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Division
                </label>
                <select
                  value={formData.division}
                  onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                  required
                >
                  {MOCK_DIVISIONS.map(div => (
                    <option key={div} value={div}>Division {div}</option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Subject / Course
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                  required
                >
                  {MOCK_SUBJECTS.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              {/* Classroom Selection (GPS-Protected) */}
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={15} color="var(--primary)" />
                    <span>Assigned Classroom / Lab (GPS Geofence)</span>
                  </label>
                  <Link to="/teacher/classrooms" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary)' }}>
                    Manage Classrooms &rarr;
                  </Link>
                </div>
                <select
                  value={formData.classroomId}
                  onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                  style={{ width: '100%', height: '42px', fontWeight: 600 }}
                  required
                >
                  {classrooms.map(room => (
                    <option key={room.id} value={room.id} disabled={room.status === 'Inactive'}>
                      {room.name} ({room.building}) — Radius: {room.radiusMeters}m {room.status === 'Inactive' ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>

                {/* Selected Classroom Geofence Specs Preview */}
                {selectedClassroom && (
                  <div 
                    style={{
                      marginTop: '10px',
                      background: 'var(--primary-light)',
                      border: '1px solid rgba(79, 70, 229, 0.2)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Navigation size={16} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                          Geofence Active: {selectedClassroom.name}
                        </div>
                        <div style={{ color: 'var(--text-muted)' }}>
                          GPS: {selectedClassroom.latitude.toFixed(6)}° N, {selectedClassroom.longitude.toFixed(6)}° E
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ background: '#FFFFFF', padding: '4px 10px', borderRadius: 'var(--radius-full)', fontWeight: 700, color: 'var(--success-text)', border: '1px solid var(--success-border)' }}>
                        Allowed Radius: {selectedClassroom.radiusMeters}m
                      </span>
                      <span style={{ background: '#FFFFFF', padding: '4px 8px', borderRadius: 'var(--radius-full)', fontSize: '11px', color: 'var(--text-muted)', border: '1px solid var(--border-light)' }}>
                        GPS Tol: ±{selectedClassroom.maxAccuracyAllowed}m
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Session Date
                </label>
                <input 
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                  required
                />
              </div>

              {/* Start Time */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Lecture Start Time
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 12:00 PM"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  style={{ width: '100%', height: '42px' }}
                  required
                />
              </div>

              {/* Validity Duration */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  QR Code Validity Duration (Auto-Expires)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {[
                    { label: '1 Minute', val: 1 },
                    { label: '2 Minutes', val: 2 },
                    { label: '5 Minutes', val: 5 },
                    { label: '10 Minutes', val: 10 }
                  ].map((dur) => (
                    <button
                      key={dur.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, validityMinutes: dur.val })}
                      style={{
                        padding: '12px 8px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '13px',
                        fontWeight: 600,
                        border: formData.validityMinutes === dur.val ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                        background: formData.validityMinutes === dur.val ? 'var(--primary-light)' : '#FFFFFF',
                        color: formData.validityMinutes === dur.val ? 'var(--primary)' : 'var(--text-main)',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {dur.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <button 
              type="submit" 
              className="btn btn-primary btn-block btn-lg"
            >
              <QrCode size={18} />
              <span>Generate Attendance QR Code</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GenerateQR;
