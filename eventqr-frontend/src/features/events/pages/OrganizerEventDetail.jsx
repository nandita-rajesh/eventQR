import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaUpload,
  FaChartBar,
  FaUserFriends,
  FaQrcode,
  FaTimes,
  FaEllipsisV,
} from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";

import styles from "./OrganizerEventDetail.module.css";
import Icon from "../../../shared/components/Icon";
import Modal from "../../../shared/components/Modal";
import {
  getEvent,
  getEventParticipants,
  searchEventParticipants,
  resendParticipantQR,
  addEventParticipant,
  updateEvent,
  deleteEvent,
  addEventSession,
} from "../../../shared/api/eventsApi";

export default function OrganizerEventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [open, setOpen] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const initials = (user?.name || "").split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

  const formatDate = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      if (isNaN(dt)) return d;
      return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    } catch (e) {
      return d;
    }
  };

  // participants
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState("");
  const [participantQuery, setParticipantQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [resendStatus, setResendStatus] = useState({});

  // add participant modal state
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  // edit event modal
  const [showEdit, setShowEdit] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // add session
  const [showAddSession, setShowAddSession] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [sessionDesc, setSessionDesc] = useState("");
  const [sessionStart, setSessionStart] = useState("");
  const [sessionEnd, setSessionEnd] = useState("");
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  // upload CSV
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  // export attendance
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');

  // fetch event
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setFetchError("");

    (async () => {
      try {
        const res = await getEvent(id);
        if (!mounted) return;
        setEventData(res);
        // populate edit form defaults
        setEditTitle(res?.title || "");
        setEditDescription(res?.description || "");
        setEditDate(res?.date || "");
        setEditVenue(res?.venue || "");
      } catch (err) {
        const events = JSON.parse(localStorage.getItem("events") || "[]");
        const localEvent = events.find((e) => String(e.id) === String(id));
        if (localEvent) setEventData(localEvent);
        else setFetchError(err.response?.data?.error || err.message || "Event not found");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [id]);

  // participants loader
  useEffect(() => {
    let mounted = true;
    const loadParticipants = async () => {
      setParticipantsLoading(true);
      setParticipantsError("");
      try {
        const data = await getEventParticipants(id);
        if (mounted) setParticipants(Array.isArray(data) ? data : data?.participants || []);
      } catch (err) {
        const status = err.response?.status || err.status || null;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (mounted) setParticipantsError(err.response?.data?.error || err.message || 'Could not load participants');
      } finally {
        if (mounted) setParticipantsLoading(false);
      }
    };

    loadParticipants();
    return () => { mounted = false; };
  }, [id, navigate]);

  // participant search debounce
  useEffect(() => {
    const q = participantQuery?.trim();
    let mounted = true;
    let t;
    const doSearch = async () => {
      setSearching(true);
      setParticipantsError("");
      try {
        const data = q ? await searchEventParticipants(id, q) : await getEventParticipants(id);
        if (mounted) setParticipants(Array.isArray(data) ? data : data?.participants || []);
      } catch (err) {
        const status = err.response?.status || err.status || null;
        if (status === 401) { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); return; }
        if (mounted) setParticipantsError(err.response?.data?.error || err.message || 'Could not search participants');
      } finally { if (mounted) setSearching(false); }
    };

    t = setTimeout(() => doSearch(), 300);
    return () => { mounted = false; clearTimeout(t); };
  }, [participantQuery, id, navigate]);

  // handlers
  const handleResend = async (participantId) => {
    try {
      setResendStatus(s => ({ ...s, [participantId]: 'sending' }));
      await resendParticipantQR(id, participantId);
      setResendStatus(s => ({ ...s, [participantId]: 'sent' }));
      setTimeout(() => setResendStatus(s => ({ ...s, [participantId]: undefined })), 3000);
    } catch (err) {
      setResendStatus(s => ({ ...s, [participantId]: 'error' }));
      setTimeout(() => setResendStatus(s => ({ ...s, [participantId]: undefined })), 3000);
    }
  };

  // ellipsis menu state + outside click
  const [showOptions, setShowOptions] = useState(false);
  const optionsRef = React.useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!optionsRef.current) return;
      if (!optionsRef.current.contains(e.target)) setShowOptions(false);
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  const handleAddParticipant = async () => {
    setAddError('');
    if (!addName.trim() || !addEmail.trim()) { setAddError('Name and email are required'); return; }
    setAddLoading(true);
    try {
      const payload = { name: addName.trim(), email: addEmail.trim(), phoneNumber: addPhone.trim() || undefined };
      const data = await addEventParticipant(id, payload);
      const newP = data?.participant || data?.participantCreated || data || {};
      if (newP && (newP._id || newP.id)) setParticipants(prev => [newP, ...prev]);
      else {
        const refreshed = await getEventParticipants(id);
        setParticipants(Array.isArray(refreshed) ? refreshed : refreshed?.participants || []);
      }
      setAddSuccess('Participant added — invitation sent');
      setTimeout(() => setAddSuccess(''), 4000);
      setShowAddParticipant(false);
    } catch (err) {
      setAddError(err.response?.data?.error || err.message || 'Could not add participant');
    } finally { setAddLoading(false); }
  };

  const handleUpdateEvent = async () => {
    setEditError('');
    if (!editTitle.trim()) { setEditError('Title is required'); return; }
    setEditLoading(true);
    try {
      const payload = { title: editTitle.trim(), description: editDescription.trim(), date: editDate, venue: editVenue };
      const updated = await updateEvent(id, payload);
      setEventData(updated || { ...eventData, ...payload });
      setShowEdit(false);
    } catch (err) {
      setEditError(err.response?.data?.error || err.message || 'Could not update event');
    } finally { setEditLoading(false); }
  };

  const handleDeleteEvent = async () => {
    setDeleteLoading(true);
    try {
      await deleteEvent(id);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.error || err.message || 'Could not delete event');
    } finally { setDeleteLoading(false); setShowDeleteConfirm(false); }
  };

  // Validate CSV headers contain name and email (case-insensitive)
  const validateCSVHeaders = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file provided'));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.onload = () => {
        const text = reader.result;
        const firstLine = text.split(/\r?\n/)[0] || '';
        // split CSV header by comma (basic)
        const headers = firstLine.split(',').map(h => h.replace(/^\"|\"$/g, '').trim().toLowerCase());
        const hasName = headers.some(h => h.includes('name'));
        const hasEmail = headers.some(h => h.includes('email'));
        if (!hasName || !hasEmail) return reject(new Error('CSV must include at least "name" and "email" headers'));
        resolve(true);
      };
      // read only first 64KB to be safe
      const blob = file.slice(0, 65536);
      reader.readAsText(blob);
    });
  };

  const handleConfirmUpload = async () => {
    setUploadError('');
    setUploadSuccess('');
    if (!uploadFile) { setUploadError('Please select a CSV file'); return; }
    const nameLower = (uploadFile.name || '').toLowerCase();
    if (!nameLower.endsWith('.csv') && uploadFile.type !== 'text/csv') { setUploadError('Please select a .csv file'); return; }

    setUploadLoading(true);
    try {
      await validateCSVHeaders(uploadFile);
    } catch (err) {
      setUploadLoading(false);
      setUploadError(err.message || 'Invalid CSV headers');
      return;
    }

    try {
      const { uploadParticipantsCSV } = await import('../../../shared/api/eventsApi');
      await uploadParticipantsCSV(id, uploadFile);
      setUploadSuccess('Participants uploaded successfully');
      setTimeout(() => setUploadSuccess(''), 4000);
      // refresh participants list
      try {
        const refreshed = await getEventParticipants(id);
        setParticipants(Array.isArray(refreshed) ? refreshed : refreshed?.participants || []);
      } catch (e) { /* ignore refresh errors */ }
      setShowUploadModal(false);
      setUploadFile(null);
    } catch (err) {
      setUploadError(err.response?.data?.error || err.message || 'Could not upload CSV');
    } finally { setUploadLoading(false); }
  };

  const handleAddSession = async () => {
    setSessionError('');
    if (!sessionName.trim() || !sessionStart || !sessionEnd) { setSessionError('Name, start and end time required'); return; }
    setSessionLoading(true);
    try {
      // convert time strings (HH:MM) to full ISO datetimes using event date
      const makeDateTime = (timeStr) => {
        if (!timeStr) return null;
        // timeStr expected like "09:30" or "09:30:00"
        const parts = timeStr.split(':').map(p => parseInt(p, 10));
        const hh = parts[0] || 0;
        const mm = parts[1] || 0;
        // base date: use eventData.date if present, otherwise today
        const base = eventData && eventData.date ? new Date(eventData.date) : new Date();
        // set local hours/minutes
        base.setHours(hh, mm, 0, 0);
        return base.toISOString();
      };

      const payload = { name: sessionName.trim(), description: sessionDesc.trim(), startTime: makeDateTime(sessionStart), endTime: makeDateTime(sessionEnd) };
      const created = await addEventSession(id, payload);
      setEventData(prev => ({ ...prev, sessions: [ ...(prev?.sessions || []), created ] }));
      setShowAddSession(false);
      setSessionName(''); setSessionDesc(''); setSessionStart(''); setSessionEnd('');
    } catch (err) {
      setSessionError(err.response?.data?.error || err.message || 'Could not add session');
    } finally { setSessionLoading(false); }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.desktopContent}>
          <div className={styles.card}>
            <div className={styles.skeletonTitle} />
            <div style={{height: 12}} />
            <div className={styles.skeletonMeta}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
            <div style={{height: 18}} />
            <div className={styles.skeletonDescription} />

            <div style={{height: 18}} />
            <div className={styles.skeletonStatsRow}>
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
              <div className={styles.skeletonCard} />
            </div>
          </div>

          <div style={{height: 18}} />

          <div className={styles.actionGrid}>
            <div className={styles.skeletonAction} />
            <div className={styles.skeletonAction} />
            <div className={styles.skeletonAction} />
            <div className={styles.skeletonAction} />
          </div>

          <div style={{height: 22}} />

          <section className={styles.participantsCard}>
            <div className={styles.participantsHeader}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonLineShort} style={{width: 160}} />
            </div>
            <div className={styles.skeletonInput} />
            <div className={styles.skeletonTable}>
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
              <div className={styles.skeletonRow} />
            </div>
          </section>

          <section className={styles.sessionsCard}>
            <div className={styles.participantsHeader}>
              <div className={styles.skeletonIcon} />
              <div className={styles.skeletonLineShort} style={{width: 120}} />
            </div>
            <div className={styles.sessionList}>
              <div className={styles.skeletonSession} />
              <div className={styles.skeletonSession} />
            </div>
          </section>
        </div>
      </div>
    );
  }
  if (fetchError) return <div style={{ padding: 40, color: '#dc2626' }}>Error: {fetchError}</div>;

  return (
    <div className={styles.page}>
      {/* MOBILE TOPBAR */}
      <header className={styles.mobileTopbar}>
        <div className={styles.leftHeader}>
          <HiOutlineMenu className={styles.mobileMenuIcon} onClick={() => setOpen(true)} />
          <span className={styles.mobileTitle}>EventQR</span>
        </div>
      </header>

      {open && <div className={styles.overlay} onClick={() => setOpen(false)} />}

      <div className={`${styles.sidebar} ${open ? styles.show : ''}`}>
        <div>
          <div className={styles.sidebarTop}>
            <div className={styles.logoRow}><FaQrcode className={styles.logoIconBlue} /><span className={styles.logoTextDark}>EventQR</span></div>
            <FaTimes className={styles.closeIcon} onClick={() => setOpen(false)} />
          </div>
          <div className={styles.menuSection}>
            <div className={styles.menuItem} onClick={() => navigate('/dashboard')}><FaCalendarAlt /><span>My Events</span></div>
          </div>
        </div>
        <div className={styles.profile}><div className={styles.avatar}>{initials}</div>
          <div><p>{user?.name || 'User'}</p><span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Organizer'}</span></div>
          <button className={styles.logoutButton} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} aria-label="Log out"><Icon name="logout" size={18} /></button>
        </div>
      </div>

      <div className={styles.desktopContent}>
        <header className={styles.topbar} onClick={() => navigate('/dashboard')}><button className={styles.backButton}><FaArrowLeft /></button><span className={styles.topbarTitle}>Back to Events</span></header>

        <div className={styles.card}>
          <div className={styles.titleRow}>
            <div>
              <h1>{eventData.title}</h1>
              <div className={styles.metaRow}><div className={styles.metaItem}><FaCalendarAlt /><span>{formatDate(eventData.date)}</span></div><div className={styles.metaItem}><FaMapMarkerAlt /><span>{eventData.venue || ''}</span></div></div>
            </div>
            <div className={styles.actionsRow}>
              <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                <div className={styles.scanWrap}>
                  {(() => {
                    const canScan = eventData?.status === 'ongoing';
                    return (
                      <button
                        className={styles.scanBtn}
                        disabled={!canScan}
                        onClick={() => canScan && navigate(`/scan/${eventData._id || eventData.id}`)}
                        title={canScan ? 'Scan QR' : 'Scanning is only available when the event is ongoing'}
                      >
                        <Icon name="qr" size={18} /><span>Scan QR</span>
                      </button>
                    );
                  })()}
                </div>

                <div className={styles.ellipsisWrap} ref={optionsRef}>
                  <button className={styles.ellipsisBtn} onClick={() => setShowOptions(s => !s)} aria-label="More actions">
                    <FaEllipsisV />
                  </button>
                  {showOptions && (
                    <div className={styles.ellipsisMenu}>
                      <button className={styles.ellipsisMenuItem} onClick={() => { setShowEdit(true); setShowOptions(false); setEditTitle(eventData.title || ''); setEditDescription(eventData.description || ''); setEditDate(eventData.date || ''); setEditVenue(eventData.venue || ''); }}>Edit event</button>
                      <button className={styles.ellipsisMenuItem} onClick={() => { setShowDeleteConfirm(true); setShowOptions(false); }}>Delete event</button>
                    </div>
                  )}
                </div>
              </div>

              
            </div>
          </div>
          <p className={styles.description}>{eventData.description}</p>

          <div className={styles.statsGrid}><div className={styles.statCard}><h2>{eventData.participants || 0}</h2><p>Registered</p></div><div className={styles.statCard}><h2>{eventData.participants || 0}</h2><p>Attended</p></div><div className={styles.statCard}><h2>100%</h2><p>Attendance Rate</p></div></div>
        </div>

        <div className={styles.actionGrid}>
          <div className={styles.actionCard} onClick={() => navigate(`/events/${eventData._id || eventData.id}/participants`)} style={{cursor: 'pointer'}}>
            <FaUsers className={styles.actionIcon} />
            <h3>Manage Participants</h3>
            <p>View and manage participant list</p>
          </div>
          <div className={styles.actionCard} onClick={() => { setShowUploadModal(true); setUploadError(''); setUploadFile(null); }} style={{cursor: 'pointer'}}>
            <FaUpload className={styles.actionIcon} />
            <h3>Upload CSV</h3>
            <p>Bulk import participants</p>
          </div>
          <div className={styles.actionCard}><FaUserFriends className={styles.actionIcon} /><h3>Manage Volunteers</h3><p>Add volunteers for this event</p></div>
          <div className={styles.actionCard} style={{cursor: exportLoading ? 'not-allowed' : 'pointer'}} onClick={async () => {
            if (exportLoading) return;
            setExportError('');
            setExportLoading(true);
            try {
              const { exportAttendanceCSV } = await import('../../../shared/api/eventsApi');
              const res = await exportAttendanceCSV(eventData._id || eventData.id);
              // try to extract filename from content-disposition
              const cd = res.headers['content-disposition'] || res.headers['Content-Disposition'] || '';
              let filename = `attendance_${eventData._id || eventData.id}.csv`;
              const m = cd.match(/filename\*=UTF-8''(.+)$|filename="?([^";]+)"?/i);
              if (m) filename = decodeURIComponent(m[1] || m[2]);
              const blob = new Blob([res.data], { type: res.data.type || 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = filename;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              setExportError(err.response?.data?.error || err.message || 'Could not export attendance');
            } finally { setExportLoading(false); }
          }}>
            <FaChartBar className={styles.actionIcon} />
            <h3>Attendance Reports</h3>
            <p>{exportLoading ? 'Exporting…' : 'Download attendance CSV'}</p>
          </div>
        </div>

        {/* Participants section */}
        <section className={styles.participantsCard}>
          <div className={styles.participantsHeader}><Icon name="users" size={20} /><h2>Participants</h2><div style={{ marginLeft: 'auto' }}><button className={styles.addBtn} onClick={() => { setShowAddParticipant(true); setAddError(''); setAddName(''); setAddEmail(''); setAddPhone(''); }}>Add Participant</button></div></div>

          {addSuccess && <div style={{marginBottom: 12}}><span className={styles.green}>{addSuccess}</span></div>}

          <input className={styles.searchInput} placeholder="Search participants..." value={participantQuery} onChange={(e) => setParticipantQuery(e.target.value)} />

          {participantsLoading ? (<p>Loading participants…</p>) : participantsError ? (<p style={{color: '#dc2626'}}>{participantsError}</p>) : (
            <div className={styles.participantList}><div className={styles.participantTable}><div className={styles.tableHead}><span>Name</span><span>Email</span><span></span></div>
              {searching ? (<p>Searching…</p>) : participants.length === 0 ? (<div className={styles.emptyState}><p>{participantQuery ? 'No matching participants found.' : 'No participants yet.'}</p></div>) : (
                participants.map(p => (
                  <div key={p._id || p.id} className={styles.tableRow}><span>{p.name}</span><span>{p.email}</span><span style={{display: 'flex', justifyContent: 'flex-end'}}><button className={styles.resendBtn} onClick={() => handleResend(p._id || p.id)}>{resendStatus[p._id || p.id] === 'sending' ? 'Sending…' : resendStatus[p._id || p.id] === 'sent' ? 'Sent' : 'Resend QR'}</button></span></div>
                ))
              )}
            </div></div>
          )}
        </section>

        {/* Sessions */}
        <section className={styles.sessionsCard} style={{ marginTop: 18 }}>
          <div className={styles.participantsHeader}><Icon name="calendar" size={20} /><h2>Sessions</h2><div style={{ marginLeft: 'auto' }}><button className={styles.addBtn} onClick={() => setShowAddSession(true)}>Add Session</button></div></div>
          <div className={styles.sessionList}>
            {(!eventData?.sessions || eventData.sessions.length === 0) ? (<p>No sessions scheduled</p>) : (eventData.sessions.map(s => (
              <div key={s._id || s.id} className={styles.sessionRow}><h3>{s.name}</h3><div className={styles.sessionMeta}><span>{s.startTime ? new Date(s.startTime).toLocaleString() : ''} to {s.endTime ? new Date(s.endTime).toLocaleString() : ''}</span></div><p>{s.description}</p></div>
            )))}
          </div>
        </section>

        {/* Add participant modal */}
        <Modal isOpen={showAddParticipant} title="Add Participant" onCancel={() => setShowAddParticipant(false)} onConfirm={handleAddParticipant} confirmLabel={addLoading ? 'Adding…' : 'Add'} cancelLabel="Cancel">
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {addError && <div style={{color: '#dc2626'}}>{addError}</div>}
            <input className={styles.searchInput} placeholder="Full name" value={addName} onChange={(e) => setAddName(e.target.value)} />
            <input className={styles.searchInput} placeholder="Email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            <input className={styles.searchInput} placeholder="Phone (optional)" value={addPhone} onChange={(e) => setAddPhone(e.target.value)} />
          </div>
        </Modal>

        {/* Edit event modal */}
        <Modal isOpen={showEdit} title="Edit Event" onCancel={() => setShowEdit(false)} onConfirm={handleUpdateEvent} confirmLabel={editLoading ? 'Saving…' : 'Save'} cancelLabel="Cancel">
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {editError && <div style={{color: '#dc2626'}}>{editError}</div>}
            <input className={styles.searchInput} placeholder="Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            <input className={styles.searchInput} placeholder="Date (YYYY-MM-DD)" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
            <input className={styles.searchInput} placeholder="Venue" value={editVenue} onChange={(e) => setEditVenue(e.target.value)} />
            <textarea className={styles.searchInput} placeholder="Description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} style={{height: 100}} />
          </div>
        </Modal>

        {/* Delete confirm modal */}
        <Modal isOpen={showDeleteConfirm} title="Delete event" onCancel={() => setShowDeleteConfirm(false)} onConfirm={handleDeleteEvent} confirmLabel={deleteLoading ? 'Deleting…' : 'Delete'} cancelLabel="Cancel">
          <div>Are you sure you want to delete this event? This action cannot be undone.</div>
        </Modal>

        {/* Add session modal */}
        <Modal isOpen={showAddSession} title="Add Session" onCancel={() => setShowAddSession(false)} onConfirm={handleAddSession} confirmLabel={sessionLoading ? 'Adding…' : 'Add'} cancelLabel="Cancel">
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {sessionError && <div style={{color: '#dc2626'}}>{sessionError}</div>}
            <input className={styles.searchInput} placeholder="Session name" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
            <input type="time" className={styles.searchInput} placeholder="Start time (HH:MM)" value={sessionStart} onChange={(e) => setSessionStart(e.target.value)} />
            <input type="time" className={styles.searchInput} placeholder="End time (HH:MM)" value={sessionEnd} onChange={(e) => setSessionEnd(e.target.value)} />
            <textarea className={styles.searchInput} placeholder="Description" value={sessionDesc} onChange={(e) => setSessionDesc(e.target.value)} style={{height: 80}} />
          </div>
        </Modal>

        {/* Upload CSV modal */}
        <Modal isOpen={showUploadModal} title="Upload Participants CSV" onCancel={() => setShowUploadModal(false)} onConfirm={handleConfirmUpload} confirmLabel={uploadLoading ? 'Uploading…' : 'Upload'} cancelLabel="Cancel">
          <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
            {uploadError && <div style={{color: '#dc2626'}}>{uploadError}</div>}
            {uploadSuccess && <div style={{color: '#16a34a'}}>{uploadSuccess}</div>}
            <div style={{fontSize: 13, color: '#64748b'}}>CSV must include at least these headers: <strong>name</strong>, <strong>email</strong></div>
            <input type="file" accept=".csv,text/csv" onChange={(e) => { setUploadError(''); setUploadFile(e.target.files?.[0] || null); }} />
            <div style={{fontSize: 13, color: '#64748b'}}>Select a CSV file with at least the columns mentioned above.</div>
          </div>
        </Modal>
      </div>
    </div>
  );
}