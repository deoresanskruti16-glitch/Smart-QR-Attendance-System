import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  ShieldAlert, 
  Sparkles, 
  Calendar, 
  Clock, 
  BookOpen, 
  Users,
  MapPin,
  ShieldCheck
} from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import StatusBadge from './StatusBadge';

const QRDisplay = ({ session, onGenerateNew, onExpire }) => {
  const canvasRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  const isExpired = !session?.isActive || (session?.expiresAt && new Date(session.expiresAt) <= new Date());
  
  // Construct scan link with complete session and classroom metadata
  const origin = window.location.origin;
  const searchParams = new URLSearchParams();
  if (session?.token) searchParams.set('token', session.token);
  if (session?.subject) searchParams.set('subject', session.subject);
  if (session?.className) searchParams.set('className', session.className);
  if (session?.division) searchParams.set('division', session.division);
  if (session?.classroomId) searchParams.set('classroomId', session.classroomId);
  if (session?.classroomName) searchParams.set('classroomName', session.classroomName);
  if (session?.latitude !== undefined) searchParams.set('lat', session.latitude.toString());
  if (session?.longitude !== undefined) searchParams.set('lon', session.longitude.toString());
  if (session?.radiusMeters !== undefined) searchParams.set('radius', session.radiusMeters.toString());
  if (session?.expiresAt) searchParams.set('expiresAt', session.expiresAt);

  const scanLink = `${origin}/student/scan?${searchParams.toString()}`;

  useEffect(() => {
    if (!session || !canvasRef.current) return;

    QRCode.toCanvas(
      canvasRef.current,
      scanLink,
      {
        width: 280,
        margin: 2,
        color: {
          dark: isExpired ? '#64748B' : '#0F172A',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      },
      (err) => {
        if (err) console.error('QR code generation error:', err);
      }
    );

    QRCode.toDataURL(scanLink, { width: 600, margin: 2 })
      .then(url => setQrUrl(url))
      .catch(err => console.error(err));
  }, [session, isExpired, scanLink]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleDownloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `SmartAttend_QR_${session.subject.replace(/\s+/g, '_')}_${session.division}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!session) return null;

  return (
    <div className="card" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
      {/* Session Metadata Banner */}
      <div 
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          color: '#FFFFFF',
          marginBottom: '20px',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase', color: '#A5B4FC', fontWeight: 700 }}>
            Session Live Attendance
          </span>
          <StatusBadge status={isExpired ? 'Expired' : 'Active'} />
        </div>

        <h2 style={{ fontSize: '20px', color: '#FFFFFF', marginBottom: '10px' }}>
          {session.subject}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '13px', color: '#E0E7FF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={15} color="#A5B4FC" />
            <span>{session.className} - Div {session.division}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} color="#A5B4FC" />
            <span>{session.date}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="#A5B4FC" />
            <span>{session.startTime} ({session.validityMinutes} mins)</span>
          </div>
        </div>

        {/* Assigned Classroom & Geofence Tag */}
        <div 
          style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            flexWrap: 'wrap',
            gap: '6px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#FDE047', fontWeight: 700 }}>
            <MapPin size={14} />
            <span>Classroom: {session.classroomName || 'Room 204 - Data Science Lab'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.25)', color: '#6EE7B7', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
            <ShieldCheck size={13} />
            <span>GPS Geofence Protected</span>
          </div>
        </div>
      </div>

      {/* Timer status */}
      <div style={{ marginBottom: '24px' }}>
        <CountdownTimer 
          expiresAt={session.expiresAt} 
          durationMinutes={session.validityMinutes}
          onExpire={onExpire}
        />
      </div>

      {/* QR Code Container with High Aesthetics */}
      <div 
        style={{
          display: 'inline-block',
          padding: '16px',
          background: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: `2px solid ${isExpired ? 'var(--border-light)' : 'var(--primary)'}`,
          boxShadow: isExpired ? 'none' : 'var(--shadow-glow)',
          position: 'relative',
          marginBottom: '24px'
        }}
      >
        <canvas 
          ref={canvasRef} 
          style={{
            display: 'block',
            borderRadius: 'var(--radius-md)',
            filter: isExpired ? 'grayscale(100%) opacity(35%)' : 'none',
            transition: 'filter 0.3s ease'
          }} 
        />

        {isExpired && (
          <div 
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.85)',
              borderRadius: 'var(--radius-xl)',
              gap: '6px',
              color: 'var(--danger-text)',
              fontWeight: 700,
              fontSize: '15px'
            }}
          >
            <ShieldAlert size={36} color="var(--danger)" />
            <span>QR Code Expired</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>Generate a new QR to resume</span>
          </div>
        )}
      </div>

      {/* Session Token Pill */}
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Session Security Token: </span>
        <code 
          style={{
            background: 'var(--bg-main)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            fontWeight: 700,
            fontSize: '13px',
            color: 'var(--primary)',
            border: '1px solid var(--border-light)'
          }}
        >
          {session.token}
        </code>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
        <button 
          onClick={handleCopyLink} 
          className="btn btn-secondary"
          title="Copy Scan Link"
        >
          {copied ? <Check size={16} color="var(--success)" /> : <Copy size={16} />}
          <span>{copied ? 'Link Copied!' : 'Copy QR Link'}</span>
        </button>

        <button 
          onClick={handleDownloadQR} 
          className="btn btn-secondary"
          title="Download QR as Image"
          disabled={!qrUrl}
        >
          <Download size={16} />
          <span>Download QR</span>
        </button>

        <a 
          href={scanLink}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline-primary"
          title="Open in student scan mode"
        >
          <ExternalLink size={16} />
          <span>Test Scan Link</span>
        </a>

        {onGenerateNew && (
          <button 
            onClick={onGenerateNew} 
            className="btn btn-primary"
          >
            <RefreshCw size={16} />
            <span>Generate New QR</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default QRDisplay;
