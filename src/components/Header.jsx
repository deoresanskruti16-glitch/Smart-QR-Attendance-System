import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { MOCK_NOTIFICATIONS } from '../data/mockData';

const Header = ({ title, subtitle, onToggleSidebar }) => {
  const { teacher } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <header className="top-header">
      <div className="header-left">
        <button 
          className="header-icon-btn d-lg-none" 
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation"
          style={{ display: 'flex' }}
        >
          <Menu size={20} />
        </button>

        <div className="header-title-container">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      <div className="header-right">
        {/* Quick Search */}
        <div className="header-search" style={{ display: 'none' /* hidden on small screen by css */ }}>
          <Search size={16} className="search-icon" />
          <input type="text" placeholder="Search records, students..." />
        </div>

        {/* Notifications Icon & Popover */}
        <div style={{ position: 'relative' }}>
          <button 
            className="header-icon-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className="notification-badge" />}
          </button>

          {showNotifications && (
            <div 
              className="card"
              style={{
                position: 'absolute',
                top: '48px',
                right: 0,
                width: '320px',
                padding: '16px',
                zIndex: 60,
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--border-light)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead} 
                    style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 600 }}
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                {notifications.map(item => (
                  <div 
                    key={item.id} 
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-md)',
                      background: item.unread ? 'var(--primary-light)' : 'var(--bg-main)',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-main)' }}>
                      <span>{item.title}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.time}</span>
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Teacher Profile Info */}
        <div className="teacher-profile-pill">
          <div className="teacher-avatar">
            {teacher?.avatar || 'YP'}
          </div>
          <div className="teacher-info-text">
            <div className="teacher-name">{teacher?.name || 'Prof. Yogesh Pathak'}</div>
            <div className="teacher-dept">{teacher?.college || 'R.C.Patel Institute of Tech'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
