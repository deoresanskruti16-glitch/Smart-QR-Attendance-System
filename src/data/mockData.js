// =========================================================
// MOCK DATA FOR SMARTATTEND SYSTEM (FRONTEND-ONLY)
// College: R.C.Patel Institute of Technology, Shirpur
// Branch: CSE(Data Science) | Class: S.Y | Division: DS-A
// Academic Year: 2026-27 | Teacher: Prof. Yogesh Pathak
// =========================================================

export const MOCK_TEACHER = {
  id: 'T-RCPIT-01',
  name: 'Prof. Yogesh Pathak',
  email: 'yogeshpathak6@gmail.com',
  password: 'Rcpit@123',
  department: 'CSE(Data Science)',
  designation: 'Assistant Professor & Class Admin',
  role: 'admin', // 'admin' | 'teacher'
  college: 'R.C.Patel Institute of Technology, Shirpur',
  avatar: 'YP',
  academicYear: '2026-27',
  notificationsCount: 2,
  permissions: {
    canManageClassrooms: true,
    canCreateSession: true,
    canViewAllSubjects: true,
    canExportReports: true,
    canManageDefaulters: true
  }
};

export const MOCK_CLASSES = [
  'S.Y',
  'T.Y',
  'Final Year'
];

export const MOCK_SUBJECTS = [
  'Database Management System',
  'Computer System Fundamental',
  'Mathematics For Intelligent System',
  'Universal Human Values'
];

export const MOCK_DIVISIONS = ['DS-A', 'DS-B'];

export const MOCK_DOMAINS = [
  'CSE(Data Science)'
];

// =========================================================
// REGISTERED CLASSROOMS WITH GPS COORDINATES & GEOFENCE RADIUS
// =========================================================
export const MOCK_CLASSROOMS = [
  {
    id: 'CR-204',
    name: 'Room 204 - Data Science Lab',
    roomNumber: '204',
    building: 'Main CS Block (2nd Floor)',
    latitude: 21.311500,
    longitude: 74.881200,
    radiusMeters: 20,
    maxAccuracyAllowed: 50,
    status: 'Active',
    description: 'Equipped with 60 High-Performance DS Workstations & Smart Projector'
  },
  {
    id: 'CR-302',
    name: 'Room 302 - HPC & AI Research Lab',
    roomNumber: '302',
    building: 'Main CS Block (3rd Floor)',
    latitude: 21.311820,
    longitude: 74.881650,
    radiusMeters: 15,
    maxAccuracyAllowed: 40,
    status: 'Active',
    description: 'Dedicated GPU Clusters & Deep Learning Lab'
  },
  {
    id: 'CR-LH-101',
    name: 'Lecture Hall 101 - Smart Classroom',
    roomNumber: 'LH-101',
    building: 'Academic Complex (Ground Floor)',
    latitude: 21.311200,
    longitude: 74.880850,
    radiusMeters: 25,
    maxAccuracyAllowed: 60,
    status: 'Active',
    description: 'Tiered seating smart theory hall for CSE(DS) batch'
  },
  {
    id: 'CR-AUD-01',
    name: 'Central Seminar Hall',
    roomNumber: 'AUD-01',
    building: 'Convention Centre',
    latitude: 21.312100,
    longitude: 74.882100,
    radiusMeters: 35,
    maxAccuracyAllowed: 80,
    status: 'Active',
    description: 'Auditorium for departmental seminars, workshops & guest lectures'
  }
];

export const MOCK_TODAYS_SESSIONS = [
  {
    id: 'SES-001',
    subject: 'Database Management System',
    className: 'S.Y',
    division: 'DS-A',
    classroomId: 'CR-204',
    classroomName: 'Room 204 - Data Science Lab',
    time: '10:00 AM',
    date: '2026-08-23',
    status: 'Completed',
    totalStudents: 4,
    presentCount: 4,
    token: 'DEMO_DBMS_01'
  },
  {
    id: 'SES-002',
    subject: 'Computer System Fundamental',
    className: 'S.Y',
    division: 'DS-A',
    classroomId: 'CR-204',
    classroomName: 'Room 204 - Data Science Lab',
    time: '12:00 PM',
    date: '2026-08-23',
    status: 'Active',
    totalStudents: 4,
    presentCount: 3,
    token: 'DEMO_CSF_02'
  },
  {
    id: 'SES-003',
    subject: 'Mathematics For Intelligent System',
    className: 'S.Y',
    division: 'DS-A',
    classroomId: 'CR-LH-101',
    classroomName: 'Lecture Hall 101 - Smart Classroom',
    time: '02:00 PM',
    date: '2026-08-23',
    status: 'Upcoming',
    totalStudents: 4,
    presentCount: 0,
    token: 'DEMO_MIS_03'
  },
  {
    id: 'SES-004',
    subject: 'Universal Human Values',
    className: 'S.Y',
    division: 'DS-A',
    classroomId: 'CR-LH-101',
    classroomName: 'Lecture Hall 101 - Smart Classroom',
    time: '04:00 PM',
    date: '2026-08-23',
    status: 'Upcoming',
    totalStudents: 4,
    presentCount: 0,
    token: 'DEMO_UHV_04'
  }
];

export const INITIAL_STUDENT_ATTENDANCE = [
  {
    id: 'ATT-1',
    prn: '251106012',
    name: 'Krutadnya Pradip Bhadane',
    domain: 'CSE(Data Science)',
    division: 'DS-A',
    time: '12:02 PM',
    status: 'Present',
    date: '2026-08-23',
    classroomId: 'CR-204',
    classroomName: 'Room 204 - Data Science Lab',
    distanceMeters: 4.8,
    gpsAccuracy: 8,
    locationVerified: true,
    verificationStatus: 'VERIFIED_IN_CLASS',
    verifiedAt: '2026-08-23T12:02:15.000Z'
  },
  {
    id: 'ATT-2',
    prn: '251106018',
    name: 'Bhumika Snehal Kothari',
    domain: 'CSE(Data Science)',
    division: 'DS-A',
    time: '12:03 PM',
    status: 'Present',
    date: '2026-08-23',
    classroomId: 'CR-204',
    classroomName: 'Room 204 - Data Science Lab',
    distanceMeters: 6.2,
    gpsAccuracy: 12,
    locationVerified: true,
    verificationStatus: 'VERIFIED_IN_CLASS',
    verifiedAt: '2026-08-23T12:03:40.000Z'
  },
  {
    id: 'ATT-3',
    prn: '251106050',
    name: 'Pranjal Rohidas Patil',
    domain: 'CSE(Data Science)',
    division: 'DS-A',
    time: '12:04 PM',
    status: 'Present',
    date: '2026-08-23',
    classroomId: 'CR-204',
    classroomName: 'Room 204 - Data Science Lab',
    distanceMeters: 3.5,
    gpsAccuracy: 6,
    locationVerified: true,
    verificationStatus: 'VERIFIED_IN_CLASS',
    verifiedAt: '2026-08-23T12:04:10.000Z'
  }
];

export const MOCK_ALL_STUDENTS = [
  { 
    prn: '251106012', 
    name: 'Krutadnya Pradip Bhadane', 
    domain: 'CSE(Data Science)', 
    division: 'DS-A', 
    totalLectures: 40, 
    attended: 38, 
    percentage: 95.0 
  },
  { 
    prn: '251106018', 
    name: 'Bhumika Snehal Kothari', 
    domain: 'CSE(Data Science)', 
    division: 'DS-A', 
    totalLectures: 40, 
    attended: 37, 
    percentage: 92.5 
  },
  { 
    prn: '251106050', 
    name: 'Pranjal Rohidas Patil', 
    domain: 'CSE(Data Science)', 
    division: 'DS-A', 
    totalLectures: 40, 
    attended: 39, 
    percentage: 97.5 
  },
  { 
    prn: '251106096', 
    name: 'Sanskruti Lalit Deore', 
    domain: 'CSE(Data Science)', 
    division: 'DS-A', 
    totalLectures: 40, 
    attended: 36, 
    percentage: 90.0 
  }
];

export const MOCK_WEEKLY_ATTENDANCE = [
  { day: 'Monday', rate: 95, sessions: 4 },
  { day: 'Tuesday', rate: 100, sessions: 4 },
  { day: 'Wednesday', rate: 92, sessions: 4 },
  { day: 'Thursday', rate: 95, sessions: 4 },
  { day: 'Friday', rate: 90, sessions: 3 },
  { day: 'Saturday', rate: 85, sessions: 2 }
];

export const MOCK_SUBJECT_PERFORMANCE = [
  { subject: 'DBMS', attendance: 96, color: '#4F46E5' },
  { subject: 'CSF', attendance: 93, color: '#06B6D4' },
  { subject: 'MIS', attendance: 91, color: '#8B5CF6' },
  { subject: 'UHV', attendance: 98, color: '#10B981' }
];

export const MOCK_NOTIFICATIONS = [
  { id: 1, title: 'Session Completed', time: '11:00 AM', desc: 'Database Management System (S.Y DS-A) attendance recorded in Room 204.', unread: true },
  { id: 2, title: 'QR Generated', time: '11:58 AM', desc: 'Active QR code generated for Computer System Fundamental (Room 204).', unread: true },
  { id: 3, title: 'Geofence Active', time: '12:00 PM', desc: 'GPS Geofencing enabled with 20m radius verification in Room 204.', unread: true }
];
