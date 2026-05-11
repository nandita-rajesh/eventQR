import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaQrcode,
  FaTimes,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaArrowLeft,
} from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import Icon from '../../../shared/components/Icon';
import Modal from '../../../shared/components/Modal';
import styles from './OrganizerEventDetail.module.css';
import {
  getEvent,
  getEventParticipants,
  searchEventParticipants,
  resendParticipantQR,
  addEventParticipant,
} from '../../../shared/api/eventsApi';

export default function OrganizerEventParticipants() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const initials = (user?.name || '').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState('');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [resendStatus, setResendStatus] = useState({});

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        const ev = await getEvent(id);
        if (!mounted) return;
        setEvent(ev);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.error || err.message || 'Could not load event');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const loadParticipants = async () => {
    setParticipantsLoading(true);
    setParticipantsError('');
    try {
      const data = await getEventParticipants(id);
      setParticipants(Array.isArray(data) ? data : data?.participants || []);
    } catch (err) {
      setParticipantsError(err.response?.data?.error || err.message || 'Could not load participants');
    } finally {
      setParticipantsLoading(false);
    }
  };

  useEffect(() => { loadParticipants(); }, [id]);

  useEffect(() => {
    const q = query?.trim();
    let t;
    const doSearch = async () => {
      setSearching(true);
      try {
        const data = q ? await searchEventParticipants(id, q) : await getEventParticipants(id);
        setParticipants(Array.isArray(data) ? data : data?.participants || []);
      } catch (err) {
        setParticipantsError(err.response?.data?.error || err.message || 'Could not search participants');
      } finally { setSearching(false); }
    };
    t = setTimeout(() => doSearch(), 300);
    return () => clearTimeout(t);
  }, [query, id]);

  const handleResend = async (pid) => {
    try {
      setResendStatus(s => ({ ...s, [pid]: 'sending' }));
      await resendParticipantQR(id, pid);
      setResendStatus(s => ({ ...s, [pid]: 'sent' }));
      setTimeout(() => setResendStatus(s => ({ ...s, [pid]: undefined })), 3000);
    } catch (err) {
      setResendStatus(s => ({ ...s, [pid]: 'error' }));
      setTimeout(() => setResendStatus(s => ({ ...s, [pid]: undefined })), 3000);
    }
  };

  const handleAdd = async () => {
    setAddError('');
    if (!name.trim() || !email.trim()) { setAddError('Name and email required'); return; }
    setAddLoading(true);
    try {
      const payload = { name: name.trim(), email: email.trim(), phoneNumber: phone.trim() || undefined };
      const data = await addEventParticipant(id, payload);
      const newP = data?.participant || data?.participantCreated || data || {};
      if (newP && (newP._id || newP.id)) setParticipants(prev => [newP, ...prev]);
      else await loadParticipants();
      setShowAdd(false);
      setName(''); setEmail(''); setPhone('');
    } catch (err) {
      setAddError(err.response?.data?.error || err.message || 'Could not add participant');
    } finally { setAddLoading(false); }
  };

  if (loading) return <div className={styles.page}><div style={{padding: 40}}>Loading…</div></div>;
  if (error) return <div className={styles.page}><div style={{padding: 40, color: '#dc2626'}}>Error: {error}</div></div>;

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
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p>{user?.name || 'User'}</p>
            <span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Organizer'}</span>
          </div>
          <button className={styles.logoutButton} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); navigate('/login'); }} aria-label="Log out"><Icon name="logout" size={18} /></button>
        </div>
      </div>

      <div className={styles.desktopContent} style={{maxWidth: 1100}}>
        <header className={styles.topbar}>
          <button className={styles.backButton} onClick={() => navigate(`/events/${id}`)}><FaArrowLeft />  <span className={styles.topbarTitle}>Back to Event</span></button>
          
        </header>

        <div className={styles.card}>
          <div className={styles.titleRow} style={{alignItems: 'center'}}>
            <div>
              <h1 style={{margin:0}}>{event?.title || 'Participants'}</h1>
              <div className={styles.metaRow}><div className={styles.metaItem}><FaCalendarAlt /><span>{event?.date ? new Date(event.date).toLocaleDateString() : ''}</span></div><div className={styles.metaItem}><FaMapMarkerAlt /><span>{event?.venue || ''}</span></div></div>
            </div>
          </div>

          <section className={styles.participantsCard} style={{minHeight: '55vh'}}>
            <div className={styles.participantsHeader}>
              <Icon name="users" size={20} />
              <h2>Participants</h2>
              <div style={{marginLeft: 'auto'}}>
                <button className={styles.addBtn} onClick={() => { setShowAdd(true); setAddError(''); setName(''); setEmail(''); setPhone(''); }}>Add Participant</button>
              </div>
            </div>

            <input className={styles.searchInput} placeholder="Search participants..." value={query} onChange={(e) => setQuery(e.target.value)} />

            {participantsLoading ? (
              <p>Loading participants…</p>
            ) : participantsError ? (
              <p style={{color: '#dc2626'}}>{participantsError}</p>
            ) : (
              <div className={styles.participantList}>
                <div className={styles.participantTable}>
                  <div className={styles.tableHead}><span>Name</span><span>Email</span><span></span></div>
                  {searching ? (
                    <p>Searching…</p>
                  ) : participants.length === 0 ? (
                    <div className={styles.emptyState}><p>No participants yet.</p></div>
                  ) : (
                    participants.map(p => (
                      <div key={p._id || p.id} className={styles.tableRow}>
                        <span>{p.name}</span>
                        <span>{p.email}</span>
                        <span style={{display: 'flex', justifyContent: 'flex-end'}}>
                          <button className={styles.resendBtn} onClick={() => handleResend(p._id || p.id)}>{resendStatus[p._id || p.id] === 'sending' ? 'Sending…' : resendStatus[p._id || p.id] === 'sent' ? 'Sent' : 'Resend QR'}</button>
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Modal isOpen={showAdd} title="Add Participant" onCancel={() => setShowAdd(false)} onConfirm={handleAdd} confirmLabel={addLoading ? 'Adding…' : 'Add'} cancelLabel="Cancel">
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {addError && <div style={{color: '#dc2626'}}>{addError}</div>}
          <input className={styles.searchInput} placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
          <input className={styles.searchInput} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={styles.searchInput} placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
}
