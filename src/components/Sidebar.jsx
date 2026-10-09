import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  UserCheck, 
  BarChart3, 
  User, 
  LogOut, 
  ExternalLink,
  ShieldCheck,
  MapPin,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { teacher, logout, isClassAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/teacher/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'Generate QR', path: '/teacher/generate-qr', icon: QrCode },
    { label: 'Live Attendance', path: '/teacher/attendance', icon: UserCheck },
    { label: 'Classroom Geofences', path: '/teacher/classrooms', icon: MapPin },
    { label: 'Reports & Analytics', path: '/teacher/reports', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-group">
            <div className="brand-icon-box">
              <QrCode size={22} />
            </div>
            <span>SmartAttend</span>
          </div>
          {onClose && (
            <button 
              className="header-icon-btn mobile-close-btn" 
              onClick={onClose}
              style={{ display: isOpen ? 'flex' : 'none', background: 'transparent', borderColor: 'rgba(255,255,255,0.2)', color: '#FFF' }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <div className="nav-section-title">Faculty Portal</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `nav-link-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}

          <div className="nav-section-title" style={{ marginTop: '16px' }}>Student View</div>
          <NavLink
            to="/student/scan"
            target="_blank"
            className="nav-link-item"
            style={{ color: '#38BDF8' }}
          >
            <ExternalLink size={18} />
            <span>Open Student Scanner</span>
          </NavLink>
        </nav>

        {/* Teacher profile & Logout */}
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
            <div className="teacher-avatar" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
              {teacher?.avatar || 'YP'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ color: '#FFF', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {teacher?.name || 'Prof. Yogesh Pathak'}
              </div>
              <div style={{ color: '#94A3B8', fontSize: '11px' }}>
                {teacher?.designation || 'Assistant Professor & Admin'}
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="sidebar-logout-btn">
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
