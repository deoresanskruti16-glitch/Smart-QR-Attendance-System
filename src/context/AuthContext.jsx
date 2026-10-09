import React, { createContext, useContext, useState, useEffect } from 'react';
import { MOCK_TEACHER } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  useEffect(() => {
    localStorage.removeItem('smartattend_teacher_auth');
  }, []);

  const [teacher, setTeacher] = useState(() => {
    const saved = localStorage.getItem('smartattend_teacher_auth_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.email === MOCK_TEACHER.email) {
          return parsed;
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [rememberMe, setRememberMe] = useState(true);

  const login = (email, password) => {
    // Validate demo credentials
    if (email.trim().toLowerCase() === MOCK_TEACHER.email.toLowerCase() && password === MOCK_TEACHER.password) {
      const user = { ...MOCK_TEACHER, loggedInAt: new Date().toISOString() };
      setTeacher(user);
      if (rememberMe) {
        localStorage.setItem('smartattend_teacher_auth_v3', JSON.stringify(user));
      }
      return { success: true };
    }
    return { 
      success: false, 
      message: `Invalid email or password. Use ${MOCK_TEACHER.email} / ${MOCK_TEACHER.password}` 
    };
  };

  const logout = () => {
    setTeacher(null);
    localStorage.removeItem('smartattend_teacher_auth_v3');
  };

  // Role permissions helpers
  const isClassAdmin = teacher?.role === 'admin' || !!teacher?.permissions?.canManageClassrooms;
  const canManageClassrooms = isClassAdmin;
  const canViewAllSubjects = isClassAdmin || !!teacher?.permissions?.canViewAllSubjects;

  return (
    <AuthContext.Provider 
      value={{ 
        teacher, 
        isAuthenticated: !!teacher, 
        isClassAdmin,
        canManageClassrooms,
        canViewAllSubjects,
        login, 
        logout, 
        rememberMe, 
        setRememberMe 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
