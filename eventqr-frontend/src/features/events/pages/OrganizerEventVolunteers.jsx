import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaQrcode, FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import { HiOutlineMenu } from 'react-icons/hi';
import Icon from '../../../shared/components/Icon';
import styles from './OrganizerEventDetail.module.css';
import { getEvent, getEventVolunteers, searchVolunteers, assignVolunteer } from '../../../shared/api/eventsApi';

export default function OrganizerEventVolunteers() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const initials = (user?.name || '').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [assignedVolunteers, setAssignedVolunteers] = useState([]);
  const [volLoading, setVolLoading] = useState(false);
  const [volError, setVolError] = useState('');

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState([]);

  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [assignStatus, setAssignStatus] = useState({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const ev = await getEvent(id);
        if (!mounted) return;
        setEvent(ev);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.error || err.message || 'Could not load event');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const loadAssigned = async () => {
    setVolLoading(true);
    setVolError('');
    try {
      const data = await getEventVolunteers(id);
      setAssignedVolunteers(Array.isArray(data) ? data : data?.volunteers || []);
    } catch (err) {
      setVolError(err.response?.data?.error || err.message || 'Could not load volunteers');
    } finally { setVolLoading(false); }
  };

  useEffect(() => { loadAssigned(); }, [id]);

  useEffect(() => {
    const q = query?.trim();
    let t;
    const doSearch = async () => {
      setSearching(true);
      setAssignError('');
      try {
        if (!q) { setResults([]); return; }
        const res = await searchVolunteers(q);
        setResults(Array.isArray(res) ? res : res?.users || []);
      } catch (err) {
        setAssignError(err.response?.data?.error || err.message || 'Could not search volunteers');
      } finally { setSearching(false); }
    };
    t = setTimeout(() => doSearch(), 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleAssign = async (volId) => {
    setAssignError('');
    setAssignLoading(true);
    setAssignStatus(s => ({ ...s, [volId]: 'sending' }));
    try {
      await assignVolunteer(id, volId);
      setAssignStatus(s => ({ ...s, [volId]: 'assigned' }));
      await loadAssigned();
    } catch (err) {
      setAssignError(err.response?.data?.error || err.message || 'Could not assign volunteer');
      setAssignStatus(s => ({ ...s, [volId]: 'error' }));
    } finally {
      setAssignLoading(false);
      setTimeout(() => setAssignError(''), 4000);
    }
  };

  if (loading) return <div className={styles.page}><div style={{padding: 40}}>Loading…</div></div>;
  if (error) return <div className={styles.page}><div style={{padding: 40, color: '#dc2626'}}>Error: {error}</div></div>;

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
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div><p>{user?.name || 'User'}</p><span>{user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Organizer'}</span></div>
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
              <h1 style={{margin:0}}>{event?.title || 'Volunteers'}</h1>
              <div className={styles.metaRow}><div className={styles.metaItem}><FaCalendarAlt /><span>{event?.date ? new Date(event.date).toLocaleDateString() : ''}</span></div><div className={styles.metaItem}><FaMapMarkerAlt /><span>{event?.venue || ''}</span></div></div>
            </div>
          </div>

          <section className={styles.participantsCard} style={{minHeight: '55vh'}}>
            <div className={styles.participantsHeader}>
              <Icon name="users" size={20} />
              <h2>Volunteers</h2>
            </div>

            {/* Search & assign at top */}
            <div style={{marginBottom: 12}}>
              <div style={{display: 'flex', gap: 8, alignItems: 'flex-start', flexWrap: 'wrap'}}>
                <div style={{flex: 1, minWidth: 240}}>
                  <input className={styles.searchInput} placeholder="Search volunteers by name or email" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <div style={{minWidth: 220}}>
                  {assignError && <div style={{color: '#dc2626', marginBottom: 8}}>{assignError}</div>}
                </div>
              </div>

              {assignError && <div style={{color: '#dc2626', marginTop: 6}}>{assignError}</div>}
              {searching ? (
                <p style={{marginTop: 8}}>Searching…</p>
              ) : results.length === 0 ? (
                <p style={{color: '#64748b', marginTop: 8}}>Type a name or email to find registered volunteers.</p>
              ) : (
                <div style={{marginTop: 8}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                    <strong>Search Results</strong>
                    <span style={{color: '#64748b', fontSize: 13}}>{results.length} result{results.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className={styles.participantList} style={{marginTop: 0}}>
                    <div className={styles.participantTable} style={{minWidth: 0}}>
                      <div className={styles.tableHead} style={{gridTemplateColumns: '1fr 1fr auto'}}><span>Name</span><span>Email</span><span></span></div>
                      {results.map(u => (
                        <div key={u._id || u.id} className={styles.tableRow} style={{gridTemplateColumns: '1fr 1fr auto'}}>
                          <span>{u.name}</span>
                          <span style={{fontSize: 13, color: '#64748b'}}>{u.email}</span>
                          <span style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <button className={styles.addBtn} onClick={() => handleAssign(u._id || u.id)} disabled={assignLoading || assignStatus[u._id || u.id] === 'sending' || assignStatus[u._id || u.id] === 'assigned'}>
                              {assignStatus[u._id || u.id] === 'sending' ? 'Assigning…' : assignStatus[u._id || u.id] === 'assigned' ? 'Assigned' : 'Assign'}
                            </button>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Assigned volunteers table (separate card) */}
            <div style={{marginTop: 14}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
                <strong>Assigned Volunteers</strong>
                <span style={{color: '#64748b', fontSize: 13}}>{assignedVolunteers.length} assigned</span>
              </div>

              <div style={{background: '#fbfdff', border: '1px solid #e8eef6', borderRadius: 12, padding: 12}}>
                {volLoading ? (
                  <p style={{margin: 0}}>Loading volunteers…</p>
                ) : volError ? (
                  <p style={{color: '#dc2626', margin: 0}}>{volError}</p>
                ) : (
                  <div className={styles.participantList}>
                    <div className={styles.participantTable}>
                      <div className={styles.tableHead}><span>Name</span><span>Email</span><span></span></div>
                      {assignedVolunteers.length === 0 ? (
                        <div className={styles.emptyState}><p>No volunteers assigned to this event.</p></div>
                      ) : (
                        assignedVolunteers.map(v => (
                          <div key={v._id || v.id} className={styles.tableRow}>
                            <span>{v.name}</span>
                            <span>{v.email}</span>
                            <span style={{display: 'flex', justifyContent: 'flex-end'}}>{/* placeholder for future actions */}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
