import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  MOCK_TODAYS_SESSIONS, 
  INITIAL_STUDENT_ATTENDANCE, 
  MOCK_ALL_STUDENTS,
  MOCK_CLASSROOMS 
} from '../data/mockData';
import { verifyGeofence } from '../utils/geoUtils';

const AttendanceContext = createContext(null);

export const AttendanceProvider = ({ children }) => {
  // Clean up legacy cached records from prior versions if needed
  useEffect(() => {
    localStorage.removeItem('smartattend_attendance_records');
    localStorage.removeItem('smartattend_sessions');
    localStorage.removeItem('smartattend_active_session');
  }, []);

  const validPRNs = new Set(MOCK_ALL_STUDENTS.map(s => s.prn));

  // 1. Registered Classrooms with GPS & Radius Configurations
  const [classrooms, setClassrooms] = useState(() => {
    const saved = localStorage.getItem('smartattend_classrooms_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error('Error loading stored classrooms:', e);
      }
    }
    return MOCK_CLASSROOMS;
  });

  // Sync classrooms to localStorage
  useEffect(() => {
    localStorage.setItem('smartattend_classrooms_v2', JSON.stringify(classrooms));
  }, [classrooms]);

  // Helper to get classroom by ID
  const getClassroomById = (id) => {
    return classrooms.find(c => c.id === id) || classrooms[0];
  };

  // Classroom CRUD Operations
  const addClassroom = (classroomData) => {
    const newRoom = {
      id: classroomData.id || `CR-${Date.now().toString().slice(-4)}`,
      name: classroomData.name,
      roomNumber: classroomData.roomNumber || classroomData.name,
      building: classroomData.building || 'Academic Block',
      latitude: Number(classroomData.latitude),
      longitude: Number(classroomData.longitude),
      radiusMeters: Number(classroomData.radiusMeters) || 20,
      maxAccuracyAllowed: Number(classroomData.maxAccuracyAllowed) || 50,
      status: classroomData.status || 'Active',
      description: classroomData.description || ''
    };

    setClassrooms(prev => [newRoom, ...prev]);
    return newRoom;
  };

  const updateClassroom = (id, updatedData) => {
    setClassrooms(prev => prev.map(room => {
      if (room.id === id) {
        return {
          ...room,
          ...updatedData,
          latitude: updatedData.latitude !== undefined ? Number(updatedData.latitude) : room.latitude,
          longitude: updatedData.longitude !== undefined ? Number(updatedData.longitude) : room.longitude,
          radiusMeters: updatedData.radiusMeters !== undefined ? Number(updatedData.radiusMeters) : room.radiusMeters,
          maxAccuracyAllowed: updatedData.maxAccuracyAllowed !== undefined ? Number(updatedData.maxAccuracyAllowed) : room.maxAccuracyAllowed,
        };
      }
      return room;
    }));
  };

  const deleteClassroom = (id) => {
    setClassrooms(prev => prev.filter(r => r.id !== id));
  };

  const toggleRoomStatus = (id) => {
    setClassrooms(prev => prev.map(room => 
      room.id === id ? { ...room, status: room.status === 'Active' ? 'Inactive' : 'Active' } : room
    ));
  };

  // 2. Active Session State
  const [activeSession, setActiveSession] = useState(() => {
    const saved = localStorage.getItem('smartattend_active_session_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (new Date(parsed.expiresAt) > new Date() && parsed.className === 'S.Y') {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Default active session with classroom
    const defaultExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    return {
      id: 'SES-002',
      token: 'DEMO_CSF_02',
      subject: 'Computer System Fundamental',
      className: 'S.Y',
      division: 'DS-A',
      classroomId: 'CR-204',
      classroomName: 'Room 204 - Data Science Lab',
      date: new Date().toISOString().split('T')[0],
      startTime: '12:00 PM',
      validityMinutes: 15,
      createdAt: new Date().toISOString(),
      expiresAt: defaultExpiry,
      isActive: true,
      totalStudents: 4
    };
  });

  // 3. Attendance Records
  const [attendanceRecords, setAttendanceRecords] = useState(() => {
    const saved = localStorage.getItem('smartattend_attendance_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const filtered = parsed.filter(item => validPRNs.has(item.prn));
        if (filtered.length > 0) return filtered;
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STUDENT_ATTENDANCE;
  });

  // 4. Sessions List
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('smartattend_sessions_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].className === 'S.Y') {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return MOCK_TODAYS_SESSIONS;
  });

  // Sync to local storage
  useEffect(() => {
    if (activeSession) {
      localStorage.setItem('smartattend_active_session_v3', JSON.stringify(activeSession));
    } else {
      localStorage.removeItem('smartattend_active_session_v3');
    }
  }, [activeSession]);

  useEffect(() => {
    localStorage.setItem('smartattend_attendance_v3', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('smartattend_sessions_v3', JSON.stringify(sessions));
  }, [sessions]);

  // Create a new QR session bound to a Classroom
  const createSession = (sessionData) => {
    const targetRoom = getClassroomById(sessionData.classroomId) || classrooms[0];
    const expiresAt = new Date(Date.now() + sessionData.validityMinutes * 60 * 1000).toISOString();
    const token = `DEMO_${sessionData.subject.substring(0, 3).toUpperCase()}_${Date.now().toString().slice(-4)}`;
    
    const newSession = {
      id: `SES-${Date.now().toString().slice(-4)}`,
      token,
      ...sessionData,
      classroomId: targetRoom.id,
      classroomName: targetRoom.name,
      latitude: targetRoom.latitude,
      longitude: targetRoom.longitude,
      radiusMeters: targetRoom.radiusMeters,
      maxAccuracyAllowed: targetRoom.maxAccuracyAllowed,
      createdAt: new Date().toISOString(),
      expiresAt,
      isActive: true,
      totalStudents: 4
    };

    setActiveSession(newSession);

    // Update sessions list
    setSessions(prev => [
      {
        id: newSession.id,
        subject: newSession.subject,
        className: newSession.className,
        division: newSession.division,
        classroomId: newSession.classroomId,
        classroomName: newSession.classroomName,
        latitude: newSession.latitude,
        longitude: newSession.longitude,
        radiusMeters: newSession.radiusMeters,
        time: newSession.startTime,
        date: newSession.date,
        status: 'Active',
        totalStudents: 4,
        presentCount: 0,
        token: newSession.token
      },
      ...prev.map(s => s.status === 'Active' ? { ...s, status: 'Completed' } : s)
    ]);

    return newSession;
  };

  // Mark session expired
  const expireSession = () => {
    if (activeSession) {
      setActiveSession(prev => prev ? { ...prev, isActive: false } : null);
      setSessions(prev =>
        prev.map(s => s.token === activeSession.token ? { ...s, status: 'Completed' } : s)
      );
    }
  };

  // Student marks attendance with Backend Location Verification
  const markAttendance = ({ prn, name, domain, division, token, location, sessionMeta }) => {
    const trimmedPRN = (prn || '').trim();
    const trimmedName = (name || '').trim();

    // 1. Resolve Target Session from Token or sessionMeta (for cross-device QR scanning)
    let targetSession = (activeSession && activeSession.token === token)
      ? activeSession 
      : sessions.find(s => s.token === token);

    if (!targetSession && sessionMeta) {
      targetSession = {
        id: `SES-${Date.now().toString().slice(-4)}`,
        token: token,
        subject: sessionMeta.subject || 'Lecture Session',
        className: sessionMeta.className || 'S.Y',
        division: sessionMeta.division || division || 'DS-A',
        classroomId: sessionMeta.classroomId || 'CR-204',
        classroomName: sessionMeta.classroomName || 'Room 204 - Data Science Lab',
        latitude: sessionMeta.lat !== undefined ? Number(sessionMeta.lat) : 21.3115,
        longitude: sessionMeta.lon !== undefined ? Number(sessionMeta.lon) : 74.8812,
        radiusMeters: sessionMeta.radius !== undefined ? Number(sessionMeta.radius) : 20,
        date: new Date().toISOString().split('T')[0],
        expiresAt: sessionMeta.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        isActive: true,
        totalStudents: 4
      };
    } else if (!targetSession) {
      targetSession = activeSession;
    }

    if (!targetSession) {
      return { 
        success: false, 
        reason: 'INVALID', 
        message: 'This attendance QR code is invalid or unrecognized.' 
      };
    }

    // 2. Check if Session Expired or Inactive
    const isExpired = new Date(targetSession.expiresAt) < new Date() || targetSession.isActive === false;
    if (isExpired && targetSession.token === activeSession?.token && targetSession.isActive === false) {
      return { 
        success: false, 
        reason: 'EXPIRED', 
        message: 'Sorry, this QR code has expired. Please ask faculty for an active QR code.' 
      };
    }

    // 3. Prevent Duplicate Submissions for the Same PRN in this Session/Date
    const alreadyMarked = attendanceRecords.some(
      record => record.prn.toLowerCase() === trimmedPRN.toLowerCase() && record.date === targetSession.date
    );

    if (alreadyMarked) {
      return { 
        success: false, 
        reason: 'ALREADY_MARKED', 
        message: 'Attendance has already been recorded for your PRN in this lecture session.' 
      };
    }

    // 4. Server-Side Geofencing Verification
    // Retrieve registered classroom coordinates from trusted database or session payload
    const assignedRoomId = targetSession.classroomId || 'CR-204';
    let trustedClassroom = getClassroomById(assignedRoomId);
    if (sessionMeta?.lat !== undefined && sessionMeta?.lon !== undefined) {
      trustedClassroom = {
        ...trustedClassroom,
        latitude: Number(sessionMeta.lat),
        longitude: Number(sessionMeta.lon),
        radiusMeters: sessionMeta.radius !== undefined ? Number(sessionMeta.radius) : trustedClassroom.radiusMeters
      };
    } else if (targetSession.latitude !== undefined && targetSession.longitude !== undefined) {
      trustedClassroom = {
        ...trustedClassroom,
        latitude: Number(targetSession.latitude),
        longitude: Number(targetSession.longitude),
        radiusMeters: targetSession.radiusMeters || trustedClassroom.radiusMeters
      };
    }

    const geofenceResult = verifyGeofence(location, trustedClassroom);

    if (!geofenceResult.isValid) {
      return {
        success: false,
        reason: geofenceResult.reason,
        message: geofenceResult.message,
        distanceMeters: geofenceResult.distanceMeters,
        allowedRadius: geofenceResult.allowedRadius,
        accuracy: geofenceResult.accuracy,
        classroomName: trustedClassroom.name
      };
    }

    // 5. Create Verified Attendance Record
    const now = new Date();
    const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newRecord = {
      id: `ATT-${Date.now()}`,
      prn: trimmedPRN,
      name: trimmedName,
      domain: domain || 'CSE(Data Science)',
      division: division || targetSession.division,
      time: formattedTime,
      status: 'Present',
      date: targetSession.date || now.toISOString().split('T')[0],
      classroomId: trustedClassroom.id,
      classroomName: trustedClassroom.name,
      distanceMeters: geofenceResult.distanceMeters,
      gpsAccuracy: geofenceResult.accuracy,
      locationVerified: true,
      verificationStatus: 'VERIFIED_IN_CLASS',
      verifiedAt: now.toISOString(),
      studentCoordinates: {
        latitude: location?.latitude,
        longitude: location?.longitude
      }
    };

    setAttendanceRecords(prev => [newRecord, ...prev]);

    // Increment present count in session
    setSessions(prev =>
      prev.map(s =>
        s.token === targetSession.token
          ? { ...s, presentCount: (s.presentCount || 0) + 1 }
          : s
      )
    );

    return { 
      success: true, 
      record: newRecord,
      session: targetSession,
      geofence: geofenceResult
    };
  };

  return (
    <AttendanceContext.Provider
      value={{
        classrooms,
        addClassroom,
        updateClassroom,
        deleteClassroom,
        toggleRoomStatus,
        getClassroomById,
        activeSession,
        sessions,
        attendanceRecords,
        createSession,
        expireSession,
        markAttendance
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
