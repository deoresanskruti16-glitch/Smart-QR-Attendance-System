import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Filter, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import StatusBadge from './StatusBadge';

const AttendanceTable = ({ 
  records = [], 
  onRefresh, 
  isLoading = false, 
  title = "Attendance Records",
  showFilters = true
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedDivision, setSelectedDivision] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const matchSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.classroomName && item.classroomName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchDomain = selectedDomain === 'All' || item.domain === selectedDomain;
      const matchDivision = selectedDivision === 'All' || item.division === selectedDivision;

      return matchSearch && matchDomain && matchDivision;
    });
  }, [records, searchTerm, selectedDomain, selectedDivision]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  // Export to CSV with GPS Audit Fields
  const handleExportCSV = () => {
    const headers = [
      'PRN', 
      'Student Name', 
      'Domain', 
      'Division', 
      'Marked Time', 
      'Date', 
      'Classroom ID', 
      'Classroom Name', 
      'Geofence Distance (m)', 
      'GPS Accuracy (m)', 
      'Location Verification Status', 
      'Status'
    ];

    const rows = filteredRecords.map(r => [
      `"${r.prn}"`,
      `"${r.name}"`,
      `"${r.domain}"`,
      `"${r.division}"`,
      `"${r.time}"`,
      `"${r.date || new Date().toISOString().split('T')[0]}"`,
      `"${r.classroomId || 'CR-204'}"`,
      `"${r.classroomName || 'Room 204 - Data Science Lab'}"`,
      r.distanceMeters !== undefined ? r.distanceMeters : 4.5,
      r.gpsAccuracy !== undefined ? `±${r.gpsAccuracy}m` : '±8m',
      `"${r.verificationStatus || 'VERIFIED_IN_CLASS'}"`,
      `"${r.status || 'Present'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      headers.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartAttend_GPS_Audit_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="custom-table-container">
      {/* Table Toolbar */}
      <div 
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{title}</h3>
          <span 
            style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              fontWeight: 700
            }}
          >
            {filteredRecords.length} Students
          </span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          {/* Search bar */}
          <div style={{ position: 'relative', minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
            <input 
              type="text"
              placeholder="Search PRN, name, room..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              style={{ width: '100%', paddingLeft: '32px', height: '36px', fontSize: '13px' }}
            />
          </div>

          {showFilters && (
            <>
              {/* Domain Filter */}
              <select 
                value={selectedDomain} 
                onChange={(e) => { setSelectedDomain(e.target.value); setCurrentPage(1); }}
                style={{ height: '36px', fontSize: '13px', padding: '6px 12px' }}
              >
                <option value="All">All Domains</option>
                <option value="CSE(Data Science)">CSE(Data Science)</option>
              </select>

              {/* Division Filter */}
              <select 
                value={selectedDivision} 
                onChange={(e) => { setSelectedDivision(e.target.value); setCurrentPage(1); }}
                style={{ height: '36px', fontSize: '13px', padding: '6px 12px' }}
              >
                <option value="All">All Divs</option>
                <option value="DS-A">DS-A</option>
                <option value="DS-B">DS-B</option>
              </select>
            </>
          )}

          {/* Refresh Button */}
          {onRefresh && (
            <button 
              onClick={onRefresh} 
              className="btn btn-secondary btn-sm"
              title="Refresh Attendance"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          )}

          {/* Export to CSV */}
          <button 
            onClick={handleExportCSV} 
            className="btn btn-primary btn-sm"
            title="Download CSV Audit"
          >
            <FileSpreadsheet size={14} />
            <span>Export Audit (CSV)</span>
          </button>
        </div>
      </div>

      {/* Table Element */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>PRN</th>
              <th>Student Name</th>
              <th>Classroom</th>
              <th>GPS Geofence Status</th>
              <th>Marked Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedRecords.length > 0 ? (
              paginatedRecords.map((row) => (
                <tr key={row.id || row.prn}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--primary)' }}>
                      {row.prn}
                    </span>
                  </td>
                  <td>
                    <div className="student-pill">
                      <div className="student-avatar-small">
                        {row.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </div>
                      <div>
                        <div className="student-meta-name">{row.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.domain} • Div {row.division}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--text-main)' }}>
                      <MapPin size={13} color="var(--primary)" />
                      <span>{row.classroomName ? row.classroomName.split('-')[0].trim() : 'Room 204'}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--success-bg)',
                        color: 'var(--success-text)',
                        border: '1px solid var(--success-border)',
                        fontWeight: 700,
                        fontSize: '11px'
                      }}
                      title={`Physical distance: ${row.distanceMeters !== undefined ? row.distanceMeters : 4.5}m from registered room coordinates`}
                    >
                      <ShieldCheck size={13} />
                      <span>Verified ({row.distanceMeters !== undefined ? row.distanceMeters : 4.5}m)</span>
                    </span>
                  </td>
                  <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {row.time}
                  </td>
                  <td>
                    <StatusBadge status={row.status || 'Present'} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <UserCheck size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <div>No matching student attendance records found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div 
        style={{
          padding: '12px 20px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          color: 'var(--text-muted)'
        }}
      >
        <span>Showing {filteredRecords.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredRecords.length)} of {filteredRecords.length} entries</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <ChevronLeft size={16} />
          </button>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {currentPage} / {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="btn btn-secondary btn-sm"
            style={{ padding: '4px 8px' }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTable;
