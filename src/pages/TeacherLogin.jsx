import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  QrCode, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle, 
  Sparkles,
  School,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { login, rememberMe, setRememberMe } = useAuth();

  const [email, setEmail] = useState('yogeshpathak6@gmail.com');
  const [password, setPassword] = useState('Rcpit@123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password);
      setIsLoading(false);

      if (res.success) {
        navigate('/teacher/dashboard');
      } else {
        setErrorMsg(res.message);
      }
    }, 400);
  };

  const handleAutofillDemo = () => {
    setEmail('yogeshpathak6@gmail.com');
    setPassword('Rcpit@123');
    setErrorMsg('');
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at 10% 20%, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.05) 50%, #F8FAFC 90%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px'
      }}
    >
      <div 
        className="card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(16px)'
        }}
      >
        {/* Brand & Logo Group */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div 
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--accent-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-glow)',
              marginBottom: '14px'
            }}
          >
            <QrCode size={30} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>
            <School size={16} />
            <span>R.C.Patel Institute of Technology, Shirpur</span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            SmartAttend
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Teacher Attendance Portal
          </p>
        </div>

        {/* Demo Credentials Quick Pill */}
        <div 
          style={{
            background: 'var(--primary-light)',
            border: '1px dashed var(--primary)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px'
          }}
        >
          <div>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>Teacher Login: </span>
            <span style={{ color: 'var(--text-muted)' }}>yogeshpathak6@gmail.com / Rcpit@123</span>
          </div>
          <button 
            type="button" 
            onClick={handleAutofillDemo}
            style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '11px', textDecoration: 'underline' }}
          >
            Autofill
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div 
            style={{
              background: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger-text)',
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '18px'
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Faculty Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. teacher@example.com"
                style={{ width: '100%', paddingLeft: '40px', height: '44px' }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px', height: '44px' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', fontSize: '13px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <span>Remember me</span>
            </label>

            <span style={{ color: 'var(--primary)', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
              Forgot Password?
            </span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            className="btn btn-primary btn-block btn-lg"
            style={{ marginBottom: '20px' }}
          >
            <LogIn size={18} />
            <span>{isLoading ? 'Signing in...' : 'Sign In as Faculty'}</span>
          </button>
        </form>

        {/* Link to Student Portal */}
        <div style={{ textAlign: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Are you a student? </span>
          <Link 
            to="/student/scan" 
            style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Scan QR Code</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
