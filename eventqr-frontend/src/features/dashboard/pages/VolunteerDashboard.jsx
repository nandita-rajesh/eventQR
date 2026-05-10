import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../shared/components/Icon";
import Modal from "../../../shared/components/Modal";
import { getVolunteerEvents } from "../../../shared/api/eventsApi";

import styles from "./VolunteerDashboard.module.css";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }

      let mounted = true;
      setLoading(true);
      setError("");
      try {
        const data = await getVolunteerEvents();
        const items = Array.isArray(data) ? data : data?.events || [];
        if (mounted) setEvents(items);
      } catch (err) {
        const status = err.response?.status || err.status || (err?.message && err.message.includes('Invalid token') ? 401 : null);
        if (status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
          return;
        }
        if (mounted) setError(err.response?.data?.error || err.message || 'Could not fetch events');
      } finally {
        if (mounted) setLoading(false);
      }
      return () => { mounted = false; };
    };

    load();
  }, [navigate]);

  const matchesQuery = (ev) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (ev.title || '').toLowerCase().includes(q) ||
      (ev.description || '').toLowerCase().includes(q) ||
      (ev.venue || ev.location || '').toLowerCase().includes(q)
    );
  };

  const upcomingEvents = events.filter(e => (e.status === 'upcoming' || new Date(e.date) > new Date())).filter(matchesQuery);
  const pastEvents = events.filter(e => (e.status === 'completed' || new Date(e.date) <= new Date())).filter(matchesQuery);

  const formatDate = (d) => {
    if (!d) return '';
    try { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d)); } catch { return d; }
  };

  const user = JSON.parse(localStorage.getItem('user')) || {};

  return (
    <div className={styles.dashboardLayout}>
      {/* Sidebar */}
      <aside
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.sidebarOpen : ""
        }`}
      >
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <Icon name="qr" size={22} color="#2563eb" />
          </div>

          <h2 className={styles.logoText}>EventQR</h2>
        </div>

        <nav className={styles.navMenu}>
          <button className={styles.navItemActive}>
            <Icon name="calendar" size={18} />
            <span>My Events</span>
          </button>
        </nav>

        <div className={styles.profileSection}>
          <div className={styles.profileLeft}>
            <div className={styles.avatar}>{(user.name || 'U').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}</div>

            <div>
              <div className={styles.profileName}>{user.name || 'Volunteer'}</div>
              <div className={styles.profileRole}>Volunteer</div>
            </div>
          </div>

          <button className={styles.logoutButton} onClick={() => setShowLogoutConfirm(true)}>
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={styles.mobileHeader}>
        <button
          className={styles.menuButton}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Icon name="menu" size={24} />
        </button>
      </div>
      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentHeader}>
          <div>
            <h1 className={styles.pageTitle}>My Events</h1>

            <p className={styles.pageSub}>
              Events assigned to you for QR scanning
            </p>
          </div>
        </div>

        <div className={styles.eventGrid}>
          {loading ? (
            [1,2,3].map(i => (
              <article key={i} className={styles.eventCard} aria-hidden>
                <div className={styles.eventCardHead}>
                  <div className={styles.skelBar} style={{width: '50%'}} />
                  <div className={`${styles.pill} ${styles.pillupcoming}`} />
                </div>

                <div className={styles.eventMeta}>
                  <div className={styles.eventMetaRow}>
                    <div className={styles.skelBar} style={{width: '40%'}} />
                  </div>

                  <div className={styles.eventMetaRow}>
                    <div className={styles.skelBar} style={{width: '60%'}} />
                  </div>
                </div>

                <div style={{height: 36}} />
              </article>
            ))
          ) : error ? (
            <p className={styles.error}>{error}</p>
          ) : events.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No events have been assigned to you yet.</p>
              <p style={{color: '#64748b'}}>Once an organizer assigns you to an event, it will appear here.</p>
            </div>
          ) : (
            // render upcoming then past as separate groups
            <>
              {upcomingEvents.map(ev => (
                <article key={ev._id || ev.id || ev.title} className={styles.eventCard}>
                  <div className={styles.eventCardHead}>
                    <h3 className={styles.eventName}>{ev.title}</h3>
                    <span className={`${styles.pill} ${styles[`pill${ev.status || 'upcoming'}`]}`}>{ev.status}</span>
                  </div>

                  <div className={styles.eventMeta}>
                    <div className={styles.eventMetaRow}>
                      <Icon name="calendar" size={16} color="#64748b" />
                      <span>{formatDate(ev.date)}</span>
                    </div>

                    <div className={styles.eventMetaRow}>
                      <Icon name="location" size={16} color="#64748b" />
                      <span>{ev.venue || ev.location}</span>
                    </div>
                  </div>

                  <button className={styles.btnPrimary} onClick={() => navigate(`/volunteer/event/${ev._id || ev.id}`)}>
                    View Event
                  </button>
                </article>
              ))}

              {pastEvents.map(ev => (
                <article key={ev._id || ev.id || ev.title} className={styles.eventCard}>
                  <div className={styles.eventCardHead}>
                    <h3 className={styles.eventName}>{ev.title}</h3>
                    <span className={`${styles.pill} ${styles[`pill${ev.status || 'completed'}`]}`}>{ev.status}</span>
                  </div>

                  <div className={styles.eventMeta}>
                    <div className={styles.eventMetaRow}>
                      <Icon name="calendar" size={16} color="#64748b" />
                      <span>{formatDate(ev.date)}</span>
                    </div>

                    <div className={styles.eventMetaRow}>
                      <Icon name="location" size={16} color="#64748b" />
                      <span>{ev.venue || ev.location}</span>
                    </div>
                  </div>

                  <button className={styles.btnPrimary} onClick={() => navigate(`/volunteer/event/${ev._id || ev.id}`)}>
                    View Event
                  </button>
                </article>
              ))}
            </>
          )}
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