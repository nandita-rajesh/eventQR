import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaQrcode, FaTimes, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import styles from './OrganizerEventDetail.module.css';
import Icon from '../../../shared/components/Icon';
import { getSessionParticipants, getEventParticipants, getEvent } from '../../../shared/api/eventsApi';

export default function SessionAttendance() {
  const navigate = useNavigate();
  const { eventId, sessionId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [sessionInfo, setSessionInfo] = useState(null);
  const [open, setOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const initials = (user?.name || '').split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [sessList, regList, ev] = await Promise.all([
          getSessionParticipants(sessionId).catch(() => []),
          getEventParticipants(eventId).catch(() => []),
          getEvent(eventId).catch(() => null),
        ]);

        if (!mounted) return;
        const sessParts = Array.isArray(sessList) ? sessList : sessList?.participants || [];
        const regs = Array.isArray(regList) ? regList : regList?.participants || [];
        setParticipants(sessParts);
        setRegisteredCount(regs.length || 0);
        setSessionInfo(ev?.sessions?.find(s => (s._id||s.id) === sessionId) || { name: '' });
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.error || err.message || 'Could not load attendance');
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [eventId, sessionId]);

  if (loading) return <div className={styles.page}><div style={{padding:40}}>Loading…</div></div>;
  if (error) return <div className={styles.page}><div style={{padding:40,color:'#dc2626'}}>Error: {error}</div></div>;

  return (
    <div className={styles.page}>
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

      <div className={styles.desktopContent} style={{maxWidth:980}}>
        <div className={styles.card}>
          <header className={styles.topbar} style={{marginBottom: 12}}>
            <button
              className={styles.backButton}
              onClick={() => {
                // Prefer going back in history so we return to the correct caller (organizer or volunteer).
                // If there is no meaningful history (direct open), compute a fallback based on the current path.
                const loc = window.location;
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  const pathname = loc.pathname || '';
                  const fallback = pathname.includes('/volunteer') ? `/volunteer/event/${eventId}` : `/events/${eventId}`;
                  navigate(fallback);
                }
              }}
            >&larr;  <span className={styles.topbarTitle}>Back to Event</span></button>
          </header>

          <div style={{marginBottom: 8}}>
            <h3 style={{margin:0}}>{sessionInfo?.name || 'Session'}</h3>
            <div style={{color:'#64748b', fontSize:13}}>Session attendance: {participants.length} / Registered: {registeredCount}</div>
          </div>

          <div style={{height:18}} />

          <section className={styles.participantsCard}>
            <div className={styles.participantsHeader}><Icon name="users" size={20} /><h2>Attended Participants</h2></div>
            <div className={styles.participantList}>
              <div className={styles.participantTable}>
                <div className={styles.tableHead}><span>Name</span><span>Email</span><span></span></div>
                {participants.length === 0 ? (
                  <div className={styles.emptyState}><p>No attendees for this session yet.</p></div>
                ) : (
                  participants.map(p => (
                    <div key={p._id || p.id || p.participant || p.email} className={styles.tableRow}>
                      <span>{p.name || p.participantName || p.participant?.name || (p.participant || '').toString()}</span>
                      <span style={{color:'#64748b'}}>{p.email || p.participant?.email || ''}</span>
                      <span />
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
