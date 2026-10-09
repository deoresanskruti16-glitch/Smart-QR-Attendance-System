import React, { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  Cell 
} from 'recharts';
import { 
  Users, 
  CalendarDays, 
  Percent, 
  AlertTriangle, 
  Download, 
  Filter, 
  Search, 
  FileSpreadsheet, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import DashboardCard from '../components/DashboardCard';
import { 
  MOCK_ALL_STUDENTS, 
  MOCK_WEEKLY_ATTENDANCE, 
  MOCK_SUBJECT_PERFORMANCE, 
  MOCK_CLASSES, 
  MOCK_SUBJECTS, 
  MOCK_DIVISIONS 
} from '../data/mockData';
import { useAttendance } from '../context/AttendanceContext';

const Reports = () => {
  const { attendanceRecords } = useAttendance();
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students
  const filteredStudents = useMemo(() => {
    return MOCK_ALL_STUDENTS.filter(student => {
      const matchSearch = 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.prn.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchDivision = selectedDivision === 'All' || student.division === selectedDivision;
      return matchSearch && matchDivision;
    });
  }, [searchTerm, selectedDivision]);

  const studentsBelow75 = useMemo(() => {
    return filteredStudents.filter(s => s.percentage < 75);
  }, [filteredStudents]);

  // Export full analytics CSV with GPS Geofence details
  const handleExportReportCSV = () => {
    const headers = [
      'PRN', 
      'Student Name', 
      'Domain', 
      'Division', 
      'Total Lectures', 
      'Attended', 
      'Attendance Percentage (%)', 
      'Eligibility Status',
      'GPS Geofence Compliance',
      'Registered Campus Location'
    ];
    
    const rows = filteredStudents.map(s => [
      `"${s.prn}"`,
      `"${s.name}"`,
      `"${s.domain}"`,
      `"${s.division}"`,
      s.totalLectures,
      s.attended,
      `"${s.percentage}%"`,
      `"${s.percentage >= 75 ? 'Eligible' : 'Defaulter / Below 75%'}"`,
      `"100% Geo-Verified In-Class"`,
      `"R.C.Patel Institute of Technology, Shirpur"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartAttend_Complete_Analytics_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Header */}
      <div style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Attendance Reports & Analytics</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            Comprehensive analytics, weekly trends, retention defaulter lists, and GPS compliance audits.
          </p>
        </div>

        <button 
          onClick={handleExportReportCSV} 
          className="btn btn-primary"
        >
          <FileSpreadsheet size={16} />
          <span>Export Analytics Report (CSV)</span>
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="metrics-grid">
        <DashboardCard 
          title="Total Registered Students"
          value={MOCK_ALL_STUDENTS.length.toString()}
          subtitle="S.Y DS-A Classmates"
          icon={Users}
          trend="100% Enrolled"
          color="#4F46E5"
          bgLight="#EEF2FF"
        />

        <DashboardCard 
          title="Total Sessions"
          value="24"
          subtitle="AY 2026-27"
          icon={CalendarDays}
          trend="96 Hours Logged"
          color="#06B6D4"
          bgLight="#ECFEFF"
        />

        <DashboardCard 
          title="Average Attendance"
          value="93.8%"
          subtitle="S.Y CSE(DS) Average"
          icon={Percent}
          trend="+2.4% Growth"
          color="#10B981"
          bgLight="#ECFDF5"
        />

        <DashboardCard 
          title="Students Below 75%"
          value={studentsBelow75.length.toString()}
          subtitle="Defaulter Action Needed"
          icon={AlertTriangle}
          trend={studentsBelow75.length === 0 ? "All Good" : "Needs Attention"}
          trendDirection={studentsBelow75.length === 0 ? "up" : "down"}
          color={studentsBelow75.length === 0 ? "#10B981" : "#EF4444"}
          bgLight={studentsBelow75.length === 0 ? "#ECFDF5" : "#FEF2F2"}
        />
      </div>

      {/* Filter Controls Card */}
      <div 
        className="card" 
        style={{
          padding: '16px 20px',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '14px', color: 'var(--text-muted)' }}>
          <Filter size={16} />
          <span>Filter Report:</span>
        </div>

        {/* Class Filter */}
        <select 
          value={selectedClass} 
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{ height: '38px', fontSize: '13px' }}
        >
          <option value="All">All Classes</option>
          {MOCK_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Subject Filter */}
        <select 
          value={selectedSubject} 
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ height: '38px', fontSize: '13px' }}
        >
          <option value="All">All Subjects</option>
          {MOCK_SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        {/* Division Filter */}
        <select 
          value={selectedDivision} 
          onChange={(e) => setSelectedDivision(e.target.value)}
          style={{ height: '38px', fontSize: '13px' }}
        >
          <option value="All">All Divisions</option>
          {MOCK_DIVISIONS.map(d => <option key={d} value={d}>Division {d}</option>)}
        </select>

        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
          <input 
            type="text"
            placeholder="Search student or PRN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '34px', height: '38px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '28px' }}>
        {/* Chart 1: Weekly Attendance Trend */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Weekly Attendance Trend</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Monday to Saturday percentage rates</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-light)', padding: '3px 8px', borderRadius: '4px' }}>
              Avg: 88%
            </span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_WEEKLY_ATTENDANCE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Attendance Rate']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="rate" fill="#4F46E5" radius={[6, 6, 0, 0]}>
                  {MOCK_WEEKLY_ATTENDANCE.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.rate >= 90 ? '#10B981' : entry.rate >= 80 ? '#4F46E5' : '#F59E0B'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#10B981', borderRadius: '2px' }} />
              <span>≥ 90% High</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#4F46E5', borderRadius: '2px' }} />
              <span>80% - 89% Normal</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '10px', height: '10px', background: '#F59E0B', borderRadius: '2px' }} />
              <span>&lt; 80% Fair</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Subject-wise Performance */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Subject-Wise Turnout</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Average student attendance per course</p>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#06B6D4', background: '#ECFEFF', padding: '3px 8px', borderRadius: '4px' }}>
              4 Subjects
            </span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_SUBJECT_PERFORMANCE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Average Turnout']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="attendance" 
                  stroke="#06B6D4" 
                  strokeWidth={3} 
                  dot={{ r: 5, fill: '#06B6D4', strokeWidth: 2, stroke: '#FFFFFF' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
            All courses maintain above the mandatory 75% college minimum threshold.
          </div>
        </div>
      </div>

      {/* Defaulter / Below 75% Critical Table */}
      {studentsBelow75.length > 0 && (
        <div className="custom-table-container" style={{ marginBottom: '28px', border: '1px solid var(--danger-border)' }}>
          <div 
            style={{
              padding: '16px 20px',
              background: 'var(--danger-bg)',
              borderBottom: '1px solid var(--danger-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={18} color="var(--danger)" />
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--danger-text)' }}>
                Attendance Defaulter Warning (&lt; 75% Requirement)
              </h3>
            </div>
            <span style={{ background: 'var(--danger)', color: '#FFF', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {studentsBelow75.length} Students At Risk
            </span>
          </div>

          <div className="table-responsive">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>PRN</th>
                  <th>Student Name</th>
                  <th>Domain</th>
                  <th>Attended / Total</th>
                  <th>Percentage</th>
                  <th>Defaulter Notice</th>
                </tr>
              </thead>
              <tbody>
                {studentsBelow75.map((st) => (
                  <tr key={st.prn}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--danger)' }}>{st.prn}</td>
                    <td style={{ fontWeight: 600 }}>{st.name}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{st.domain}</td>
                    <td>{st.attended} / {st.totalLectures} Lectures</td>
                    <td>
                      <span style={{ fontWeight: 800, color: 'var(--danger)', fontSize: '14px' }}>
                        {st.percentage}%
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '11px', background: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '4px', fontWeight: 700 }}>
                        Parent Letter Required
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Master Student Records Table */}
      <div className="custom-table-container">
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
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Master Student Attendance List</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Individual cumulative attendance records across the term with GPS physical verification compliance
            </p>
          </div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
            {filteredStudents.length} Students Total
          </span>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>PRN</th>
                <th>Student Name</th>
                <th>Domain</th>
                <th>Division</th>
                <th>Lectures Attended</th>
                <th>Attendance %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((st) => (
                <tr key={st.prn}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>{st.prn}</td>
                  <td>
                    <div className="student-pill">
                      <div className="student-avatar-small">
                        {st.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <span className="student-meta-name">{st.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{st.domain}</td>
                  <td>Div {st.division}</td>
                  <td>{st.attended} / {st.totalLectures}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{
                            width: `${st.percentage}%`,
                            height: '100%',
                            background: st.percentage >= 75 ? '#10B981' : '#EF4444'
                          }} 
                        />
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '13px', color: st.percentage >= 75 ? 'var(--text-main)' : 'var(--danger)' }}>
                        {st.percentage}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span 
                      style={{
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: st.percentage >= 75 ? 'var(--success-bg)' : 'var(--danger-bg)',
                        color: st.percentage >= 75 ? 'var(--success-text)' : 'var(--danger-text)',
                        border: `1px solid ${st.percentage >= 75 ? 'var(--success-border)' : 'var(--danger-border)'}`
                      }}
                    >
                      {st.percentage >= 75 ? 'Eligible' : 'Defaulter'}
                    </span>
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

export default Reports;
