import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CountdownTimer = ({ expiresAt, onExpire, durationMinutes = 5 }) => {
  const calculateRemaining = () => {
    if (!expiresAt) return 0;
    const diff = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
    return diff;
  };

  const [timeLeft, setTimeLeft] = useState(calculateRemaining);
  const totalSeconds = durationMinutes * 60;

  useEffect(() => {
    setTimeLeft(calculateRemaining());

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire) {
          onExpire();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft > 0 && timeLeft <= 60; // Under 1 minute

  // Circular progress calculation
  const progressPercent = isExpired ? 0 : Math.min(100, (timeLeft / totalSeconds) * 100);
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div 
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '12px 20px',
        borderRadius: 'var(--radius-lg)',
        background: isExpired 
          ? 'var(--bg-main)' 
          : isUrgent 
            ? 'var(--danger-bg)' 
            : 'var(--primary-light)',
        border: `1px solid ${
          isExpired 
            ? 'var(--border-light)' 
            : isUrgent 
              ? 'var(--danger-border)' 
              : 'rgba(79, 70, 229, 0.2)'
        }`,
        transition: 'all 0.3s ease'
      }}
    >
      <div 
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isExpired ? '#E2E8F0' : isUrgent ? '#FEE2E2' : '#E0E7FF',
          color: isExpired ? '#64748B' : isUrgent ? 'var(--danger)' : 'var(--primary)'
        }}
      >
        {isExpired ? (
          <AlertTriangle size={20} />
        ) : (
          <Clock size={20} className={isUrgent ? 'animate-pulse' : ''} />
        )}
      </div>

      <div>
        <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {isExpired ? 'Session Expired' : 'QR Active Countdown'}
        </div>
        <div 
          style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '22px',
            fontWeight: 800,
            color: isExpired ? 'var(--text-muted)' : isUrgent ? 'var(--danger)' : 'var(--primary)',
            letterSpacing: '1px'
          }}
        >
          {isExpired ? '00:00 (Expired)' : formatTime(timeLeft)}
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
