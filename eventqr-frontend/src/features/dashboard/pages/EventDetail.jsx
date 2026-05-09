import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Icon from "../../../shared/components/Icon";
import Modal from "../../../shared/components/Modal";
import layoutStyles from "./VolunteerDashboard.module.css";
import { getVolunteerEvent, getEventParticipants, searchEventParticipants, resendParticipantQR } from "../../../shared/api/eventsApi";

import styles from "./EventDetail.module.css";

export default function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState('');
  const [participantQuery, setParticipantQuery] = useState('');
  const [resendStatus, setResendStatus] = useState({});
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getVolunteerEvent(id);
        if (mounted) setEvent(data);
      } catch (err) {
        const status = err.response?.status || err.status || null;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (mounted) setError(err.response?.data?.error || err.message || 'Could not load event');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [id, navigate]);

  useEffect(() => {
    let mounted = true;
    const loadParticipants = async () => {
      setParticipantsLoading(true);
      setParticipantsError('');
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

  // server-side search with debounce
  useEffect(() => {
    const q = participantQuery?.trim();
    let mounted = true;
    let t;
    const doSearch = async () => {
      setSearching(true);
      setParticipantsError('');
      try {
        const data = q ? await searchEventParticipants(id, q) : await getEventParticipants(id);
        if (mounted) setParticipants(Array.isArray(data) ? data : data?.participants || []);
      } catch (err) {
        const status = err.response?.status || err.status || null;
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (mounted) setParticipantsError(err.response?.data?.error || err.message || 'Could not search participants');
      } finally {
        if (mounted) setSearching(false);
      }
    };

    // debounce 300ms
    t = setTimeout(() => {
      doSearch();
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [participantQuery, id, navigate]);

  if (loading) return <div className={styles.page}><p>Loading event…</p></div>;
  if (error) return <div className={styles.page}><p className={styles.error}>{error}</p></div>;
  if (!event) return <div className={styles.page}><p>Event not found</p></div>;

  const { title, description, venue, date, sessions = [], stats = {} } = event;
  return (
    <div className={layoutStyles.dashboardLayout}>
      {/* Sidebar */}
      <aside className={`${layoutStyles.sidebar} ${sidebarOpen ? layoutStyles.sidebarOpen : ""}`}>
        <div className={layoutStyles.logoSection}>
          <div className={layoutStyles.logoIcon}>
            <Icon name="qr" size={22} color="#2563eb" />
          </div>

          <h2 className={layoutStyles.logoText}>EventQR</h2>
        </div>

        <nav className={layoutStyles.navMenu}>
          <button className={layoutStyles.navItemActive}>
            <Icon name="calendar" size={18} />
            <span>My Events</span>
          </button>
        </nav>

        <div className={layoutStyles.profileSection}>
          <div className={layoutStyles.profileLeft}>
            <div className={layoutStyles.avatar}>{(JSON.parse(localStorage.getItem('user'))?.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>

            <div>
              <div className={layoutStyles.profileName}>{JSON.parse(localStorage.getItem('user'))?.name || 'Volunteer'}</div>
              <div className={layoutStyles.profileRole}>Volunteer</div>
            </div>
          </div>

          <button className={layoutStyles.logoutButton} onClick={() => setShowLogoutConfirm(true)}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className={layoutStyles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      <div className={layoutStyles.mobileHeader}>
        <button className={layoutStyles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Icon name="menu" size={24} />
        </button>
      </div>

      <main className={layoutStyles.mainContent}>
        <div className={styles.page}>

      {/* EVENT CARD */}

      <section className={styles.eventCard}>
        <div className={styles.eventTop}>
          <div>
            <h1 className={styles.eventTitle}>
              {title}
            </h1>

            <div className={styles.metaRow}>
              <Icon name="calendar" size={16} />
              <span>{new Date(date).toLocaleString()}</span>
            </div>

            <div className={styles.metaRow}>
              <Icon name="location" size={16} />
              <span>{venue}</span>
            </div>
          </div>

          <div className={styles.scanWrap}>
            <button
              className={styles.scanBtn}
              onClick={() => navigate(`/scan/${event._id}`)}
            >
              <Icon name="qr" size={18} />
              <span>Scan QR</span>
            </button>
          </div>
        </div>

        {/* STATS */}

        <div className={styles.stats}>
          <div>
            <h3>{stats.totalParticipants ?? sessions.length}</h3>
            <span>Total</span>
          </div>

          <div>
            <h3 className={styles.green}>{stats.checkedIn ?? 0}</h3>
            <span>Checked In</span>
          </div>

          <div>
            <h3 className={styles.gray}>{stats.pending ?? Math.max(0, (stats.totalParticipants ?? sessions.length) - (stats.checkedIn ?? 0))}</h3>
            <span>Pending</span>
          </div>
        </div>
      </section>

      {/* PARTICIPANTS */}

      <section className={styles.participantsCard}>
        <div className={styles.participantsHeader}>
          <Icon name="users" size={20} />
          <h2>Participants</h2>
        </div>

        <input
          className={styles.searchInput}
          placeholder="Search participants..."
          value={participantQuery}
          onChange={(e) => setParticipantQuery(e.target.value)}
        />

        {participantsLoading ? (
          <p>Loading participants…</p>
        ) : participantsError ? (
          <p className={styles.error}>{participantsError}</p>
        ) : (
          <div className={styles.participantList}>
            <div className={styles.tableHead}>
              <span>Name</span>
              <span>Email</span>
              <span></span>
            </div>

            {searching ? (
              <p>Searching…</p>
            ) : participants.length === 0 ? (
              <div className={styles.emptyState}>
                <p>{participantQuery ? 'No matching participants found.' : 'No participants yet.'}</p>
              </div>
            ) : (
              participants.map(p => (
                <div key={p._id} className={styles.tableRow}>
                  <span>{p.name}</span>
                  <span>{p.email}</span>

                  <span style={{display: 'flex', justifyContent: 'flex-end'}}>
                    <button
                      className={styles.resendBtn}
                      onClick={async () => {
                        try {
                          setResendStatus(s => ({...s, [p._id]: 'sending'}));
                          await resendParticipantQR(id, p._id);
                          setResendStatus(s => ({...s, [p._id]: 'sent'}));
                          setTimeout(() => setResendStatus(s => ({...s, [p._id]: undefined})), 3000);
                        } catch (err) {
                          setResendStatus(s => ({...s, [p._id]: 'error'}));
                          setTimeout(() => setResendStatus(s => ({...s, [p._id]: undefined})), 3000);
                        }
                      }}
                    >
                      {resendStatus[p._id] === 'sending' ? 'Sending…' : resendStatus[p._id] === 'sent' ? 'Sent' : 'Resend QR'}
                    </button>
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* SESSIONS */}

      <section className={styles.sessionsCard}>
        <div className={styles.participantsHeader}>
          <Icon name="calendar" size={20} />
          <h2>Sessions</h2>
        </div>

        <div className={styles.sessionList}>
          {sessions.length === 0 ? (
            <p>No sessions scheduled</p>
          ) : (
            sessions.map(s => (
              <div key={s._id} className={styles.sessionRow}>
                <h3>{s.name}</h3>
                <div className={styles.sessionMeta}>
                  <span>{new Date(s.startTime).toLocaleString()} to {new Date(s.endTime).toLocaleString()}</span>
                </div>
                <p>{s.description}</p>
              </div>
            ))
          )}
        </div>
      </section>
        </div>
      </main>

      <Modal
        isOpen={showLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to log out?"
        onCancel={() => setShowLogoutConfirm(false)}
        onConfirm={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setShowLogoutConfirm(false);
          navigate('/login');
        }}
        confirmLabel="Log out"
        cancelLabel="Cancel"
      />
    </div>
  );
}