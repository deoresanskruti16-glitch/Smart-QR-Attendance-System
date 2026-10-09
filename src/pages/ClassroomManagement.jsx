import React, { useState } from 'react';
import { 
  MapPin, 
  Plus, 
  Edit3, 
  Trash2, 
  Navigation, 
  ShieldCheck, 
  Sliders, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Building2, 
  Compass, 
  Sparkles, 
  RefreshCw,
  Search,
  Check,
  X
} from 'lucide-react';
import { useAttendance } from '../context/AttendanceContext';
import { useAuth } from '../context/AuthContext';
import { calculateHaversineDistance, isValidCoordinate, offsetCoordinates } from '../utils/geoUtils';
import StatusBadge from '../components/StatusBadge';

const ClassroomManagement = () => {
  const { classrooms, addClassroom, updateClassroom, deleteClassroom, toggleRoomStatus } = useAttendance();
  const { isClassAdmin } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    roomNumber: '',
    building: '',
    latitude: '21.311500',
    longitude: '74.881200',
    radiusMeters: 20,
    maxAccuracyAllowed: 50,
    status: 'Active',
    description: ''
  });

  // Simulator State for Admin Testing
  const [testRoomId, setTestRoomId] = useState(classrooms[0]?.id || 'CR-204');
  const [testStudentLat, setTestStudentLat] = useState('21.311530');
  const [testStudentLng, setTestStudentLng] = useState('74.881220');
  const [testAccuracy, setTestAccuracy] = useState(10);

  const activeTestingRoom = classrooms.find(c => c.id === testRoomId) || classrooms[0];

  // Open Modal for New Classroom
  const handleOpenAddModal = () => {
    setEditingRoomId(null);
    setFormData({
      id: `CR-${Date.now().toString().slice(-4)}`,
      name: '',
      roomNumber: '',
      building: 'Main Academic Block (2nd Floor)',
      latitude: '21.311500',
      longitude: '74.881200',
      radiusMeters: 20,
      maxAccuracyAllowed: 50,
      status: 'Active',
      description: ''
    });
    setFormError('');
    setLocationSuccessMsg('');
    setIsModalOpen(true);
  };

  // Open Modal for Editing
  const handleOpenEditModal = (room) => {
    setEditingRoomId(room.id);
    setFormData({
      id: room.id,
      name: room.name,
      roomNumber: room.roomNumber || '',
      building: room.building || '',
      latitude: room.latitude.toString(),
      longitude: room.longitude.toString(),
      radiusMeters: room.radiusMeters || 20,
      maxAccuracyAllowed: room.maxAccuracyAllowed || 50,
      status: room.status || 'Active',
      description: room.description || ''
    });
    setFormError('');
    setLocationSuccessMsg('');
    setIsModalOpen(true);
  };

  // Capture Live Device GPS Coordinates via Browser Geolocation API
  const handleCaptureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setFormError('');
    setLocationSuccessMsg('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude.toFixed(6);
        const lng = position.coords.longitude.toFixed(6);
        const acc = Math.round(position.coords.accuracy);

        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));

        setIsLocating(false);
        setLocationSuccessMsg(`GPS Fix Acquired! Lat: ${lat}, Lng: ${lng} (Accuracy: ±${acc}m)`);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Failed to get current GPS location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser.';
        } else if (error.code === error.TIMEOUT) {
          msg = 'Location request timed out. Please retry.';
        }
        setFormError(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Handle Form Submit (Save / Update)
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Classroom name is required.');
      return;
    }

    if (!isValidCoordinate(formData.latitude, formData.longitude)) {
      setFormError('Please enter valid numerical Latitude (-90 to 90) and Longitude (-180 to 180).');
      return;
    }

    if (editingRoomId) {
      updateClassroom(editingRoomId, formData);
    } else {
      addClassroom(formData);
    }

    setIsModalOpen(false);
  };

  // Filter classrooms by search query
  const filteredClassrooms = classrooms.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.building && r.building.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Compute live test distance
  let testDistance = null;
  let isTestInside = false;
  let testError = null;

  if (activeTestingRoom && isValidCoordinate(testStudentLat, testStudentLng)) {
    try {
      testDistance = calculateHaversineDistance(
        testStudentLat,
        testStudentLng,
        activeTestingRoom.latitude,
        activeTestingRoom.longitude
      );
      isTestInside = testDistance <= activeTestingRoom.radiusMeters;
    } catch (e) {
      testError = e.message;
    }
  }

  // Quick preset test buttons
  const setSimulationPreset = (type) => {
    if (!activeTestingRoom) return;
    if (type === 'inside') {
      // 5m away
      const offset = offsetCoordinates(activeTestingRoom.latitude, activeTestingRoom.longitude, 5, 45);
      setTestStudentLat(offset.latitude.toString());
      setTestStudentLng(offset.longitude.toString());
      setTestAccuracy(8);
    } else if (type === 'boundary') {
      // exactly on boundary
      const offset = offsetCoordinates(activeTestingRoom.latitude, activeTestingRoom.longitude, activeTestingRoom.radiusMeters, 90);
      setTestStudentLat(offset.latitude.toString());
      setTestStudentLng(offset.longitude.toString());
      setTestAccuracy(12);
    } else if (type === 'canteen') {
      // 120m away outside
      const offset = offsetCoordinates(activeTestingRoom.latitude, activeTestingRoom.longitude, 120, 180);
      setTestStudentLat(offset.latitude.toString());
      setTestStudentLng(offset.longitude.toString());
      setTestAccuracy(15);
    } else if (type === 'campus_gate') {
      // 350m away
      const offset = offsetCoordinates(activeTestingRoom.latitude, activeTestingRoom.longitude, 350, 270);
      setTestStudentLat(offset.latitude.toString());
      setTestStudentLng(offset.longitude.toString());
      setTestAccuracy(20);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--primary)', background: 'var(--primary-light)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              Class Admin Authority
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>GPS Geofencing Active</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Classroom Location Registration</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Configure authorized physical coordinates and permitted radius boundaries for each lecture room to block proxy attendance.
          </p>
        </div>

        <button 
          onClick={handleOpenAddModal} 
          className="btn btn-primary"
        >
          <Plus size={16} />
          <span>Register New Classroom</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="metrics-grid" style={{ marginBottom: '28px' }}>
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Registered Classrooms</span>
            <div className="metric-icon-box" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
              <Building2 size={22} />
            </div>
          </div>
          <div className="metric-value">{classrooms.length}</div>
          <div className="metric-footer">
            <span className="trend-badge trend-up">
              <CheckCircle2 size={12} />
              <span>{classrooms.filter(c => c.status === 'Active').length} Active</span>
            </span>
            <span>in system</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Standard Geofence Radius</span>
            <div className="metric-icon-box" style={{ background: '#ECFEFF', color: '#06B6D4' }}>
              <Sliders size={22} />
            </div>
          </div>
          <div className="metric-value">15m - 35m</div>
          <div className="metric-footer">
            <span style={{ color: 'var(--text-muted)' }}>Tailored to room capacity</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Geofence Distance Engine</span>
            <div className="metric-icon-box" style={{ background: '#ECFDF5', color: '#10B981' }}>
              <Navigation size={22} />
            </div>
          </div>
          <div className="metric-value">Haversine</div>
          <div className="metric-footer">
            <span className="trend-badge trend-up">High Precision (R=6,371km)</span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">GPS Accuracy Threshold</span>
            <div className="metric-icon-box" style={{ background: '#FEF3C7', color: '#D97706' }}>
              <ShieldCheck size={22} />
            </div>
          </div>
          <div className="metric-value">±50m</div>
          <div className="metric-footer">
            <span style={{ color: 'var(--text-muted)' }}>Weak signals rejected</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Classroom List & Live Distance Simulator */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        {/* Left Column: Registered Classrooms */}
        <div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Registered Classrooms & Labs</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Click edit to modify coordinates or geofence radius</p>
              </div>

              <div style={{ position: 'relative', width: '200px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input 
                  type="text" 
                  placeholder="Search room..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', height: '34px', fontSize: '12px', paddingLeft: '30px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredClassrooms.map((room) => (
                <div 
                  key={room.id}
                  style={{
                    background: room.status === 'Active' ? '#FFFFFF' : '#F8FAFC',
                    border: `1px solid ${room.status === 'Active' ? 'var(--border-light)' : 'var(--border-subtle)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px',
                    boxShadow: 'var(--shadow-xs)',
                    opacity: room.status === 'Active' ? 1 : 0.75,
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>
                          {room.name}
                        </span>
                        <StatusBadge status={room.status} />
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} />
                        <span>{room.building}</span>
                        <span>•</span>
                        <code>ID: {room.id}</code>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button 
                        onClick={() => handleOpenEditModal(room)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Edit Coordinates & Radius"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        onClick={() => toggleRoomStatus(room.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Toggle Active/Inactive"
                      >
                        {room.status === 'Active' ? <X size={14} color="var(--danger)" /> : <Check size={14} color="var(--success)" />}
                      </button>
                      <button 
                        onClick={() => deleteClassroom(room.id)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '4px 8px' }}
                        title="Delete Classroom"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Geofence Parameters Pill */}
                  <div 
                    style={{
                      background: 'var(--bg-main)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '8px',
                      fontSize: '12px',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Latitude</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{room.latitude.toFixed(6)}° N</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Longitude</span>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)' }}>{room.longitude.toFixed(6)}° E</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Geofence Radius</span>
                      <span style={{ fontWeight: 800, color: 'var(--success-text)' }}>{room.radiusMeters} meters</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700 }}>Max GPS Tolerance</span>
                      <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>±{room.maxAccuracyAllowed}m</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Geofence Distance Sandbox & Simulator */}
        <div>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Compass size={20} color="var(--primary)" />
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>Geofence Verification Sandbox</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Simulate student GPS coordinates to verify Haversine distance calculations and out-of-bounds rejection before deploying to students.
            </p>

            {/* Target Classroom Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                Target Classroom for Test
              </label>
              <select 
                value={testRoomId} 
                onChange={(e) => setTestRoomId(e.target.value)}
                style={{ width: '100%', height: '40px', fontWeight: 600 }}
              >
                {classrooms.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Radius: {c.radiusMeters}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Simulation Presets */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Quick Test Scenarios (Click to load):
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setSimulationPreset('inside')}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '11px', borderLeft: '3px solid var(--success)' }}
                >
                  🟢 Inside Class (5m away)
                </button>
                <button 
                  type="button" 
                  onClick={() => setSimulationPreset('boundary')}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '11px', borderLeft: '3px solid var(--warning)' }}
                >
                  🟡 On Boundary ({activeTestingRoom?.radiusMeters}m)
                </button>
                <button 
                  type="button" 
                  onClick={() => setSimulationPreset('canteen')}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '11px', borderLeft: '3px solid var(--danger)' }}
                >
                  🔴 Canteen (120m away)
                </button>
                <button 
                  type="button" 
                  onClick={() => setSimulationPreset('campus_gate')}
                  className="btn btn-secondary btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '11px', borderLeft: '3px solid var(--danger)' }}
                >
                  🔴 College Gate (350m)
                </button>
              </div>
            </div>

            {/* Test Coordinate Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Simulated Student Lat
                </label>
                <input 
                  type="text" 
                  value={testStudentLat}
                  onChange={(e) => setTestStudentLat(e.target.value)}
                  style={{ width: '100%', height: '36px', fontSize: '12px', fontFamily: 'monospace' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                  Simulated Student Lng
                </label>
                <input 
                  type="text" 
                  value={testStudentLng}
                  onChange={(e) => setTestStudentLng(e.target.value)}
                  style={{ width: '100%', height: '36px', fontSize: '12px', fontFamily: 'monospace' }}
                />
              </div>
            </div>

            {/* Verification Result Display */}
            {testDistance !== null && (
              <div 
                style={{
                  padding: '16px',
                  borderRadius: 'var(--radius-md)',
                  background: isTestInside ? 'var(--success-bg)' : 'var(--danger-bg)',
                  border: `1px solid ${isTestInside ? 'var(--success-border)' : 'var(--danger-border)'}`,
                  color: isTestInside ? 'var(--success-text)' : 'var(--danger-text)',
                  marginBottom: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, fontSize: '14px' }}>
                    {isTestInside ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <span>{isTestInside ? 'LOCATION VERIFIED (PRESENT)' : 'ATTENDANCE REJECTED (OUT OF BOUNDS)'}</span>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: '16px' }}>
                    {testDistance}m
                  </span>
                </div>

                <p style={{ fontSize: '12px', lineHeight: 1.4, margin: 0 }}>
                  {isTestInside 
                    ? `Student is ${testDistance}m from ${activeTestingRoom.name}. This is within the permitted ${activeTestingRoom.radiusMeters}m geofence radius. Attendance will be recorded.`
                    : `Student is ${testDistance}m from ${activeTestingRoom.name}. Permitted radius is ${activeTestingRoom.radiusMeters}m. Distance exceeds allowance by ${(testDistance - activeTestingRoom.radiusMeters).toFixed(1)}m. Attendance is blocked.`
                  }
                </p>
              </div>
            )}

            {/* Technical Haversine Formula Reference Card */}
            <div 
              style={{
                background: '#0F172A',
                color: '#E2E8F0',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}
            >
              <div style={{ color: '#38BDF8', fontWeight: 700, marginBottom: '4px' }}>
                Mathematical Distance Calculation:
              </div>
              <div>d = 2R · arcsin(√(sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)))</div>
              <div style={{ color: '#94A3B8', marginTop: '4px' }}>R = 6,371,000 meters • Precision: ±0.1m</div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Dialog for Add / Edit Classroom */}
      {isModalOpen && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px'
          }}
        >
          <div 
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '28px',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={22} color="var(--primary)" />
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>
                  {editingRoomId ? 'Edit Classroom Coordinates' : 'Register New Classroom'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="header-icon-btn"
                style={{ width: '32px', height: '32px' }}
              >
                <X size={16} />
              </button>
            </div>

            {formError && (
              <div style={{ background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger-text)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {locationSuccessMsg && (
              <div style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', color: 'var(--success-text)', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{locationSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Room ID / Code *
                  </label>
                  <input 
                    type="text" 
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="e.g. CR-204"
                    required
                    style={{ width: '100%', height: '40px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Classroom / Lab Name *
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Room 204 - Data Science Lab"
                    required
                    style={{ width: '100%', height: '40px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                  Building & Floor Location
                </label>
                <input 
                  type="text" 
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  placeholder="e.g. Main CS Block (2nd Floor)"
                  style={{ width: '100%', height: '40px' }}
                />
              </div>

              {/* Live Geolocation Button */}
              <div 
                style={{
                  background: 'var(--primary-light)',
                  border: '1px dashed var(--primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  marginBottom: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--primary)' }}>
                    Physical Location Setup Tool
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Stand in the classroom and click to auto-detect device coordinates.
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleCaptureCurrentLocation}
                  disabled={isLocating}
                  className="btn btn-primary btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  <Navigation size={14} className={isLocating ? 'animate-spin' : ''} />
                  <span>{isLocating ? 'Detecting...' : 'Use My GPS'}</span>
                </button>
              </div>

              {/* Coordinates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Latitude (Decimal Degrees) *
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="21.311500"
                    required
                    style={{ width: '100%', height: '40px', fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Longitude (Decimal Degrees) *
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="74.881200"
                    required
                    style={{ width: '100%', height: '40px', fontFamily: 'monospace' }}
                  />
                </div>
              </div>

              {/* Radius Configuration */}
              <div style={{ marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 600 }}>
                    Permitted Geofence Radius: <strong style={{ color: 'var(--primary)', fontSize: '15px' }}>{formData.radiusMeters} meters</strong>
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {formData.radiusMeters <= 15 ? 'Strict (Small Lab)' : formData.radiusMeters <= 30 ? 'Standard Classroom' : 'Large Seminar Hall'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="100" 
                  step="5"
                  value={formData.radiusMeters}
                  onChange={(e) => setFormData({ ...formData, radiusMeters: Number(e.target.value) })}
                  style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  <span>5m (Tight)</span>
                  <span>25m (Recommended)</span>
                  <span>50m</span>
                  <span>100m (Auditorium)</span>
                </div>
              </div>

              {/* Accuracy Tolerance */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Max GPS Accuracy Threshold
                  </label>
                  <select 
                    value={formData.maxAccuracyAllowed}
                    onChange={(e) => setFormData({ ...formData, maxAccuracyAllowed: Number(e.target.value) })}
                    style={{ width: '100%', height: '40px' }}
                  >
                    <option value={30}>±30m (High Strictness)</option>
                    <option value={50}>±50m (Recommended)</option>
                    <option value={75}>±75m (Lenient Indoor)</option>
                    <option value={100}>±100m (Relaxed)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                    Status
                  </label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', height: '40px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  <Check size={16} />
                  <span>{editingRoomId ? 'Update Classroom' : 'Save Classroom'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassroomManagement;
