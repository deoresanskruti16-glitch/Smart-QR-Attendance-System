import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  const normalized = (status || '').toLowerCase();
  
  let badgeClass = 'status-badge';
  let dotClass = 'status-dot';

  switch (normalized) {
    case 'active':
    case 'ongoing':
      badgeClass += ' status-active';
      break;
    case 'completed':
    case 'finished':
      badgeClass += ' status-completed';
      break;
    case 'upcoming':
    case 'scheduled':
      badgeClass += ' status-upcoming';
      break;
    case 'present':
      badgeClass += ' status-present';
      break;
    case 'absent':
      badgeClass += ' status-absent';
      break;
    case 'expired':
      badgeClass += ' status-expired';
      break;
    default:
      badgeClass += ' status-completed';
  }

  return (
    <span className={`${badgeClass} ${className}`}>
      <span className={dotClass}></span>
      <span>{status}</span>
    </span>
  );
};

export default StatusBadge;
