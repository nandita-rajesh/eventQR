import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Icon from "../../shared/components/Icon";
import styles from "./QRScanner.module.css";
import { getVolunteerEvent, scanAttendance, searchEventParticipants, markAttendanceManual } from "../../shared/api/eventsApi";
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchingParticipants, setSearchingParticipants] = useState(false);

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
              const info = normalizeScanResponse(res) || { token };
              setScans(prev => [{ ok: true, info, at: new Date() }, ...prev].slice(0, 10));
              const msg = res?.message || 'Attendance marked';
              showToast(info?.name ? `${info.name} — ${msg}` : msg, 'success');
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

  // Manual participant search and mark attendance
  useEffect(() => {
    let t;
    if (!searchQuery) { setSearchResults([]); setSearchingParticipants(false); return; }
    setSearchingParticipants(true);
    t = setTimeout(async () => {
      try {
        const res = await searchEventParticipants(id, searchQuery);
        const items = Array.isArray(res) ? res : res?.participants || res?.data || [];
        setSearchResults(items);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setSearchingParticipants(false);
      }
    }, 300);

    return () => clearTimeout(t);
  }, [searchQuery, id]);

  const handleManualMark = async (participantId) => {
    if (!selectedSession) { showToast('Select a session first', 'error'); return; }
    setScanLoading(true);
    try {
      const res = await markAttendanceManual(participantId, selectedSession);
      const info = normalizeScanResponse(res) || { id: participantId };
      setScans(prev => [{ ok: true, info, at: new Date() }, ...prev].slice(0, 10));
      const msg = res?.message || 'Attendance marked';
      showToast(info?.name ? `${info.name} — ${msg}` : msg, 'success');
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Could not mark attendance';
      setScans(prev => [{ ok: false, info: { message: msg }, at: new Date() }, ...prev].slice(0, 10));
      showToast(msg, 'error');
    } finally {
      setScanLoading(false);
    }
  };

  const normalizeScanResponse = (res) => {
    if (!res) return null;
    // server may return different shapes; try multiple locations
    // 1) res.attendance.attendance.participant (id string) with res.attendance.name
    const attWrap = res?.attendance;
    if (attWrap) {
      const inner = attWrap.attendance || attWrap;
      const pid = inner?.participant;
      const name = attWrap?.name || inner?.name || res?.name;
      if (pid) {
        if (typeof pid === 'object') return pid;
        return { id: pid, name };
      }
    }

    // 2) res.participant could be object or id
    if (res?.participant) {
      if (typeof res.participant === 'object') return res.participant;
      return { id: res.participant, name: res?.name };
    }

    // 3) nested res.data.participant
    if (res?.data?.participant) {
      if (typeof res.data.participant === 'object') return res.data.participant;
      return { id: res.data.participant, name: res.data?.name || res?.name };
    }

    // 4) top-level name
    if (res?.name) return { name: res.name };

    // fallback: return res (may be token or message)
    return res;
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
        {/* manual search fallback (for browsers that block camera) */}
        <div style={{marginTop: 12}}>
          <label style={{display: 'block', marginBottom: 8}}>Search participant (name or email)</label>
          <input className={styles.searchInput} placeholder="Search by name or email" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <div style={{marginTop: 8}}>
            {searchingParticipants ? (<div>Searching…</div>) : searchResults.length === 0 ? (<div style={{color: '#64748b'}}>No results</div>) : (
              <div style={{maxHeight: 180, overflowY: 'auto'}}>
                {searchResults.map(p => (
                  <div key={p._id || p.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eef2f7'}}>
                    <div>
                      <div style={{fontWeight: 600}}>{p.name}</div>
                      <div style={{fontSize: 13, color: '#64748b'}}>{p.email}</div>
                    </div>
                    <div>
                      <button className={styles.addBtn} onClick={() => handleManualMark(p._id || p.id)} disabled={scanLoading}>{scanLoading ? 'Marking…' : 'Mark attendance'}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                  <h3>{s.info.name || 'Unknown'}</h3>
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