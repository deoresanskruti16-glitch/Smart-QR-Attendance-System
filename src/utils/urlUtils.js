/**
 * URL RESOLUTION & VERCEL PREVIEW DETECTION UTILITY
 * Project: SmartAttend - Smart QR Attendance System
 * =========================================================
 * Prevents Vercel Preview deployment URLs (which have Vercel Authentication /
 * Deployment Protection enabled by default) from being encoded in QR codes.
 * Ensures QR codes always point to the public, stable Production URL.
 */

export const resolveProductionUrl = (customOverride = '') => {
  // 1. User manual override (from UI input or localStorage)
  if (customOverride && customOverride.trim().startsWith('http')) {
    return customOverride.trim().replace(/\/$/, '');
  }
  
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('smartattend_custom_domain');
    if (saved && saved.trim().startsWith('http')) {
      return saved.trim().replace(/\/$/, '');
    }
  }

  // 2. Explicit environment variable (from .env or Vercel Environment Variables)
  if (import.meta.env.VITE_APP_URL) {
    return import.meta.env.VITE_APP_URL.trim().replace(/\/$/, '');
  }
  if (import.meta.env.VITE_PUBLIC_URL) {
    return import.meta.env.VITE_PUBLIC_URL.trim().replace(/\/$/, '');
  }

  // 3. Current browser origin
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return origin || 'http://localhost:5173';
  }

  // 4. Auto-detect Vercel preview domain and normalize to production domain
  try {
    const url = new URL(origin);
    const hostname = url.hostname; // e.g. "smart-qr-attendance-system-git-main-deoresanskruti16-glitch.vercel.app"

    if (hostname.endsWith('.vercel.app')) {
      // Branch deployment pattern: <project-name>-git-<branch>-<scope>.vercel.app
      if (hostname.includes('-git-')) {
        const projectName = hostname.split('-git-')[0];
        return `https://${projectName}.vercel.app`;
      }
      
      // Hash preview deployment pattern: <project-name>-<hash>-<scope>.vercel.app
      const previewMatch = hostname.match(/^([a-z0-9-]+)-[a-z0-9]{6,12}-[a-z0-9-]+\.vercel\.app$/i);
      if (previewMatch && previewMatch[1]) {
        return `https://${previewMatch[1]}.vercel.app`;
      }
    }
  } catch (e) {
    console.warn('URL parsing fallback:', e);
  }

  return origin;
};

export const isVercelPreview = (urlStr) => {
  if (!urlStr) return false;
  return urlStr.includes('-git-') || (urlStr.includes('.vercel.app') && urlStr.split('.vercel.app')[0].split('-').length > 4);
};
