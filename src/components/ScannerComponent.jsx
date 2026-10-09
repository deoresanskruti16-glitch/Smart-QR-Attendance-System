import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  CameraOff, 
  Upload, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

const ScannerComponent = ({ onScanSuccess, defaultToken = '' }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [manualToken, setManualToken] = useState(defaultToken);
  const [mode, setMode] = useState('camera'); // 'camera', 'file', 'manual'
  const html5QrCodeRef = useRef(null);
  const readerElementId = 'html5-qr-reader-container';

  // Helper to extract token from URL or raw string
  const parseToken = (decodedText) => {
    try {
      if (decodedText.includes('token=')) {
        const url = new URL(decodedText.startsWith('http') ? decodedText : `http://localhost/${decodedText}`);
        const token = url.searchParams.get('token');
        if (token) return token;
      }
    } catch (e) {
      console.warn('URL parsing fallback:', e);
    }
    return decodedText.trim();
  };

  const startScanner = async () => {
    setCameraError(null);
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }

      const qrCodeSuccessCallback = (decodedText) => {
        const extractedToken = parseToken(decodedText);
        stopScanner();
        if (onScanSuccess) {
          onScanSuccess(extractedToken);
        }
      };

      const qrErrorCallback = (error) => {
        // Continuous scan error can be ignored
      };

      const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        config,
        qrCodeSuccessCallback,
        qrErrorCallback
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Camera start error:', err);
      setCameraError('Camera unavailable or permission denied. Use manual token entry or upload a QR image.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Failed to stop camera:', err);
      }
    }
  };

  useEffect(() => {
    // Auto-start camera when mode is 'camera'
    if (mode === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [mode]);

  // Handle image upload scanning
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(readerElementId);
      }
      const decodedText = await html5QrCodeRef.current.scanFile(file, true);
      const token = parseToken(decodedText);
      if (onScanSuccess) {
        onScanSuccess(token);
      }
    } catch (err) {
      console.error('Failed to read QR image:', err);
      setCameraError('Could not find a valid QR code in this image. Please try another image or manual entry.');
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;
    const token = parseToken(manualToken);
    if (onScanSuccess) {
      onScanSuccess(token);
    }
  };

  return (
    <div>
      {/* Scanner Mode Tabs */}
      <div 
        style={{
          display: 'flex',
          background: 'var(--bg-main)',
          padding: '4px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '20px',
          border: '1px solid var(--border-light)'
        }}
      >
        <button
          onClick={() => setMode('camera')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: mode === 'camera' ? '#FFFFFF' : 'transparent',
            color: mode === 'camera' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: mode === 'camera' ? 'var(--shadow-xs)' : 'none'
          }}
        >
          <Camera size={15} />
          <span>Camera</span>
        </button>

        <button
          onClick={() => setMode('file')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: mode === 'file' ? '#FFFFFF' : 'transparent',
            color: mode === 'file' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: mode === 'file' ? 'var(--shadow-xs)' : 'none'
          }}
        >
          <Upload size={15} />
          <span>Upload Image</span>
        </button>

        <button
          onClick={() => setMode('manual')}
          style={{
            flex: 1,
            padding: '8px 12px',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: mode === 'manual' ? '#FFFFFF' : 'transparent',
            color: mode === 'manual' ? 'var(--primary)' : 'var(--text-muted)',
            boxShadow: mode === 'manual' ? 'var(--shadow-xs)' : 'none'
          }}
        >
          <KeyRound size={15} />
          <span>Manual Token</span>
        </button>
      </div>

      {/* Mode 1: Camera Scanner */}
      {mode === 'camera' && (
        <div>
          <div className="scanner-viewport-box">
            <div id={readerElementId} style={{ width: '100%', height: '100%' }}></div>
            {isScanning && <div className="scan-laser-line"></div>}
            
            {!isScanning && (
              <div style={{ color: '#94A3B8', textAlign: 'center', padding: '20px', position: 'absolute' }}>
                <Camera size={40} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
                <p style={{ fontSize: '13px' }}>Camera is idle or initializing...</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '16px' }}>
            {!isScanning ? (
              <button onClick={startScanner} className="btn btn-primary btn-sm">
                <Camera size={15} />
                <span>Start Scanner</span>
              </button>
            ) : (
              <button onClick={stopScanner} className="btn btn-danger btn-sm">
                <CameraOff size={15} />
                <span>Stop Scanner</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Upload QR Image */}
      {mode === 'file' && (
        <div style={{ marginBottom: '20px' }}>
          <div 
            style={{
              border: '2px dashed var(--primary)',
              background: 'var(--primary-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 20px',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              style={{
                position: 'absolute',
                inset: 0,
                opacity: 0,
                cursor: 'pointer'
              }}
            />
            <Upload size={38} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--primary)' }}>
              Click or Drag QR Image Here
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supports PNG, JPG, JPEG QR code screenshots
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Manual Token Input */}
      {mode === 'manual' && (
        <form onSubmit={handleManualSubmit} style={{ marginBottom: '20px' }}>
          <div style={{ marginBottom: '14px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
              Attendance Session Token / QR URL
            </label>
            <input 
              type="text" 
              placeholder="e.g. DEMO_DBMS_01 or paste full URL"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              style={{ width: '100%', height: '42px' }}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            <span>Proceed to Details</span>
            <ArrowRight size={16} />
          </button>
        </form>
      )}

      {/* Camera / Upload Error Banner */}
      {cameraError && (
        <div 
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid var(--warning-border)',
            color: 'var(--warning-text)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            fontSize: '12px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            marginBottom: '16px',
            textAlign: 'left'
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Demo Quick Tokens for instant presentation testing */}
      <div 
        style={{
          marginTop: '16px',
          padding: '12px',
          background: 'var(--bg-main)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-light)',
          textAlign: 'left'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Quick Demo Tokens (Click to auto-fill):
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {['DEMO_DBMS_01', 'DEMO_CSF_02', 'DEMO_MIS_03'].map(tok => (
            <button
              key={tok}
              type="button"
              onClick={() => {
                setManualToken(tok);
                setMode('manual');
              }}
              style={{
                fontSize: '11px',
                fontFamily: 'monospace',
                background: '#FFFFFF',
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-light)',
                color: 'var(--primary)',
                fontWeight: 600
              }}
            >
              {tok}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScannerComponent;
