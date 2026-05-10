import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Icon from "../../shared/components/Icon";
import styles from "./QRScanner.module.css";
import { getVolunteerEvent, scanAttendance } from "../../shared/api/eventsApi";
import Webcam from "react-webcam";
import jsQR from "jsqr";

export default function QRScanner() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [eventTitle, setEventTitle] = useState('');
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [scans, setScans] = useState([]);
  const [scanLoading, setScanLoading] = useState(false);
  const [scanError, setScanError] = useState('');
  const [scannerInitializing, setScannerInitializing] = useState(false);
  const [mediaSupported, setMediaSupported] = useState(null); // null=unknown, true/false
  const [userMediaError, setUserMediaError] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getVolunteerEvent(id);
        if (!mounted) return;
        setEventTitle(data.title || data.name || 'Event');
        setSessions(data.sessions || []);
        if ((data.sessions || []).length > 0) setSelectedSession((data.sessions || [])[0]._id || (data.sessions || [])[0].id || '');
      } catch (err) {
        // ignore — user will see default UI
      }
    };

    load();
    return () => { mounted = false; };
  }, [id]);

  // Webcam + jsQR scanning loop
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const lastTokensRef = useRef(new Map()); // token -> timestamp

  useEffect(() => {
    const startLoop = () => {
      if (scanIntervalRef.current) return;
      scanIntervalRef.current = setInterval(async () => {
        try {
          const video = webcamRef.current?.video;
          const canvas = canvasRef.current;
          if (!video || video.readyState !== 4 || !canvas) return;

          const vw = video.videoWidth;
          const vh = video.videoHeight;
          if (!vw || !vh) return;

          // draw scaled down for performance
          const maxW = 640;
          const scale = Math.min(1, maxW / vw);
          const w = Math.floor(vw * scale);
          const h = Math.floor(vh * scale);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code?.data) {
            const token = code.data.trim();
            const now = Date.now();
            const last = lastTokensRef.current.get(token) || 0;
            if (now - last < 5000) return; // ignore duplicates within 5s
            lastTokensRef.current.set(token, now);

            if (!selectedSession) {
              const msg = 'Select a session before scanning';
              setScanError(msg);
              setScans(prev => [{ ok: false, info: { message: msg }, at: new Date() }, ...prev].slice(0, 10));
              return;
            }

            setScanLoading(true);
            setScanError('');
            try {
              const res = await scanAttendance(token, selectedSession);
              const participant = res?.attendance?.participant || res?.participant || res?.data?.participant;
              const info = participant || res?.data || res || { token };
              setScans(prev => [{ ok: true, info, at: new Date() }, ...prev].slice(0, 10));
              const msg = res?.message || 'Attendance marked';
              showToast(participant?.name ? `${participant.name} — ${msg}` : msg, 'success');
            } catch (err) {
              const msg = err.response?.data?.error || err.message || 'Scan failed';
              setScans(prev => [{ ok: false, info: { message: msg }, at: new Date() }, ...prev].slice(0, 10));
              setScanError(msg);
              showToast(msg, 'error');
            } finally {
              setScanLoading(false);
            }
          }
        } catch (e) {
          // ignore frame errors
        }
      }, 300);
    };

    const stopLoop = () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };

    if (cameraActive) startLoop();
    else stopLoop();

    return () => stopLoop();
  }, [cameraActive, selectedSession]);

  // Image upload fallback: decode an uploaded image using jsQR
  const handleUpload = (file) => {
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        const w = Math.floor(img.width * scale);
        const h = Math.floor(img.height * scale);
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code?.data) {
          const token = code.data.trim();
          if (!selectedSession) {
            const msg = 'Select a session before scanning';
            setScanError(msg);
            setScans(prev => [{ ok: false, info: { message: msg }, at: new Date() }, ...prev].slice(0, 10));
            return;
          }
          setScanLoading(true);
          try {
            const res = await scanAttendance(token, selectedSession);
            const participant = res?.attendance?.participant || res?.participant || res?.data?.participant;
            const info = participant || res?.data || res || { token };
            setScans(prev => [{ ok: true, info, at: new Date() }, ...prev].slice(0, 10));
            const msg = res?.message || 'Attendance marked';
            showToast(participant?.name ? `${participant.name} — ${msg}` : msg, 'success');
          } catch (err) {
            const msg = err.response?.data?.error || err.message || 'Scan failed';
            setScans(prev => [{ ok: false, info: { message: msg }, at: new Date() }, ...prev].slice(0, 10));
            setScanError(msg);
            showToast(msg, 'error');
          } finally {
            setScanLoading(false);
          }
        } else {
          setScanError('Could not detect a QR code in the uploaded image');
        }
      } catch (e) {
        setScanError('Could not process uploaded image');
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => { setScanError('Could not load image'); URL.revokeObjectURL(url); };
    img.src = url;
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}

      <header className={styles.mobileHeader}>
        <button
            className={styles.backLink}
            onClick={() => navigate(-1)}
        >
            ←
            <span>Back to Event</span>
        </button>

        <div className={styles.headerCenter}>
            <Icon name="qr" size={18} color="#2563eb" />

            <span className={styles.headerTitle}>
            {eventTitle || 'Event'}
            </span>
        </div>
      </header>

      {/* SCANNER CARD */}

      <section className={styles.scannerCard}>
        <h1 className={styles.sectionTitle}>
          Scan QR Code
        </h1>

        {/* CAMERA AREA */}

        <div className={styles.cameraArea}>
          {cameraActive ? (
            <div style={{width: '100%', height: '100%', position: 'relative'}}>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "environment" }}
                  className={styles.webcamVideo}
                  muted
                  playsInline
                  onUserMedia={() => { setMediaSupported(true); setUserMediaError(''); }}
                  onUserMediaError={(e) => {
                    setMediaSupported(false);
                    const msg = e?.name ? `${e.name}: ${e.message || ''}` : String(e);
                    setUserMediaError(msg);
                  }}
                />

              <div className={styles.overlayGuide} aria-hidden />
              <canvas ref={canvasRef} style={{display: 'none'}} />
            </div>
          ) : (
            <>
              <div className={styles.cameraIcon}>
                <Icon
                    name="camera"
                    size={72}
                    color="#475569"
                />
              </div>

              <span>Camera not active</span>
            </>
          )}
        </div>

        {/* BUTTON */}

        <button className={styles.cameraBtn} disabled={scannerInitializing} onClick={() => { setCameraActive(a => !a); }}>
          <Icon
            name="video"
            size={18}
            color="#ffffff"
            />
          <span>{scannerInitializing ? 'Starting…' : cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
        </button>

        <p className={styles.cameraText}>
          Grant camera permission to scan QR codes.
        </p>

        {/* SESSION */}

        <div className={styles.sessionSection}>
          <label>Current Session</label>

          <select className={styles.sessionSelect} value={selectedSession} onChange={(e) => setSelectedSession(e.target.value)}>
            <option value="">-- Select session --</option>
            {(sessions || []).map(s => (
              <option key={s._id || s.id} value={s._id || s.id}>{s.name || s.title || s.sessionName || (s._id || s.id)}</option>
            ))}
          </select>
        </div>
        {/* image upload fallback (for browsers that block camera) */}
        <div style={{marginTop: 12}}>
          <label style={{display: 'block', marginBottom: 8}}>Upload QR image (fallback)</label>
          <input type="file" accept="image/*" onChange={(e) => handleUpload(e.target.files?.[0])} />
        </div>

        {/* explicit message when media is unsupported */}
        {mediaSupported === false && (
          <div style={{marginTop: 12, color: '#b91c1c'}}>
            <p><strong>Camera unavailable:</strong> {userMediaError || 'Browser blocked camera or it is not supported in this context.'}</p>
            <p>Please open this page in your device browser (Chrome on Android, Safari on iOS) and ensure the site is served over HTTPS or use the app on localhost for development.</p>
          </div>
        )}

        {scanError && <div style={{color: '#dc2626', marginTop: 8}}>{scanError}</div>}
      </section>

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'error' ? styles.error : styles.success}`} role="status">
          {toast.text}
        </div>
      )}

      {/* RECENT SCANS */}

      <section className={styles.infoCard}>
        <h2 className={styles.cardTitle}>
          Recent Scans
        </h2>

        {scans.length === 0 ? (
          <div className={styles.emptyState}><p>No scans yet</p></div>
        ) : (
          scans.map((s, i) => (
            <div key={i} className={styles.scanItem}>
              <div className={styles.scanLeft}>
                <div className={s.ok ? styles.successIcon : styles.failIcon}>
                  {s.ok ? '✓' : '✕'}
                </div>

                <div>
                  <h3>{s.info?.name || s.info?.email || s.info?.message || s.info?.token || 'Unknown'}</h3>
                  <span>{(sessions.find(ss => (ss._id||ss.id) === selectedSession)?.name) || ''}</span>
                </div>
              </div>

              <span className={styles.scanTime}>
                {new Date(s.at).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </section>
    </div>
  );
}