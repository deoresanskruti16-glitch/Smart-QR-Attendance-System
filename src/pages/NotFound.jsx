import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileQuestion, 
  Home, 
  QrCode, 
  LogIn, 
  ArrowLeft 
} from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--bg-main)',
        textAlign: 'center'
      }}
    >
      <div className="card" style={{ maxWidth: '460px', padding: '40px 24px', borderRadius: 'var(--radius-xl)' }}>
        <div 
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}
        >
          <FileQuestion size={44} />
        </div>

        <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--primary)', marginBottom: '4px' }}>
          404
        </h1>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '10px' }}>
          Page Not Found
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>
          The attendance page or portal link you are looking for does not exist or has been moved.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => navigate('/teacher/dashboard')}
            className="btn btn-primary"
          >
            <LogIn size={16} />
            <span>Go to Teacher Dashboard</span>
          </button>

          <button 
            onClick={() => navigate('/student/scan')}
            className="btn btn-secondary"
          >
            <QrCode size={16} />
            <span>Go to Student QR Scanner</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
