import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  School, 
  HelpCircle,
  LogIn
} from 'lucide-react';
import ScannerComponent from '../components/ScannerComponent';

const StudentScan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token');

  // If token is already in URL parameters when student navigates here, navigate straight to student details
  useEffect(() => {
    if (urlToken) {
      navigate(`/student/details?token=${encodeURIComponent(urlToken)}`);
    }
  }, [urlToken, navigate]);

  const handleScanSuccess = (token) => {
    if (token) {
      navigate(`/student/details?token=${encodeURIComponent(token)}`);
    }
  };

  return (
    <div className="student-portal-wrapper animate-fade-in">
      <div className="student-portal-container">
        {/* Top Mini Brand Header */}
        <div className="student-brand-header">
          <div className="student-brand-logo">
            <QrCode size={28} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600 }}>
            <School size={15} />
            <span>R.C.Patel Institute of Technology, Shirpur</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>
            SmartAttend
          </h1>
        </div>

        {/* Scanner Card */}
        <div className="student-card">
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px', color: 'var(--text-main)' }}>
            Scan Attendance QR
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px', lineHeight: 1.4 }}>
            Scan the dynamic QR code displayed on your teacher's projector or screen to mark your attendance.
          </p>

          {/* QR Scanner Component */}
          <ScannerComponent onScanSuccess={handleScanSuccess} />

          {/* Helpful Tips */}
          <div 
            style={{
              marginTop: '20px',
              padding: '12px 14px',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '12px',
              color: 'var(--primary-hover)'
            }}
          >
            <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Instant Verification:</strong> Your attendance will be securely timestamped and verified in real-time.
            </div>
          </div>
        </div>

        {/* Switch to Teacher Portal */}
        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button 
            onClick={() => navigate('/teacher/login')}
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              fontSize: '13px', 
              color: 'var(--text-muted)', 
              fontWeight: 600 
            }}
          >
            <LogIn size={15} />
            <span>Faculty / Teacher Login</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentScan;
