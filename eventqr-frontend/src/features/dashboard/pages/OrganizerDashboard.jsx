import React, { useState } from "react";
import styles from "./OrganizerDashboard.module.css";
import EventCard from "../components/EventCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getOrganizerEvents } from "../../../shared/api/eventsApi";
import {
  FaQrcode,
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaPlus
} 
from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import Icon from "../../../shared/components/Icon";
import Modal from "../../../shared/components/Modal";


const OrganizerDashboard = () => {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState(() => {
    return JSON.parse(localStorage.getItem("events")) || [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "organizer") {
      navigate("/dashboard/volunteer");
    }

    // fetch events for organizer
    const token = localStorage.getItem("token");
    if (!token) {
      // no token -> redirect to login
      localStorage.removeItem("user");
      navigate("/login");
      return;
    }

    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getOrganizerEvents();
        const apiEvents = Array.isArray(data) ? data : data?.events || [];

        // locally created events
        const localEvents =
          JSON.parse(localStorage.getItem("events")) || [];

        // merge both
        const mergedEvents = [...localEvents, ...apiEvents];

        if (mounted) setEvents(mergedEvents);

      } catch (err) {
        // handle 401 from backend (invalid token)
        const status = err.response?.status || err.status || (err?.message && err.message.includes('Invalid token') ? 401 : null);
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }
        if (mounted) setError(err.response?.data?.error || err.message || "Could not fetch events");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [navigate]);
  
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "organizer") {
    return null;
  }

  const initials = (user?.name || "").split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const formatDate = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(dt);
    } catch (e) {
      return d;
    }
  };

  // derive filtered lists once to avoid repeating logic in JSX
  const matchesQuery = (ev) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      (ev.title || '').toLowerCase().includes(q) ||
      (ev.description || '').toLowerCase().includes(q) ||
      (ev.location || ev.venue || '').toLowerCase().includes(q)
    );
  };

  const upcomingEvents = events.filter(e => (e.status === 'upcoming' || new Date(e.date) > new Date())).filter(matchesQuery);
  const pastEvents = events.filter(e => (e.status === 'completed' || new Date(e.date) <= new Date())).filter(matchesQuery);

  return (
  <>
    {/* OVERLAY */}
    {open && (
      <div
        className={styles.overlay}
        onClick={() => setOpen(false)}
      />
    )}

    {/* MOBILE TOPBAR */}
    <header className={styles.topHeader}>
      <div className={styles.leftHeader}>

        <HiOutlineMenu
          className={styles.mobileMenuIcon}
          onClick={() => setOpen(true)}
        />

        <span className={styles.mobileTitle}>
          EventQR
        </span>

      </div>
    </header>

    {/* SIDEBAR */}
    <div className={`${styles.sidebar} ${open ? styles.show : ""}`}>

        {/* TOP */}
        <div>
          <div className={styles.sidebarTop}>
            <div className={styles.logoRow}>
              <FaQrcode className={styles.logoIconBlue} />
              <span className={styles.logoTextDark}>EventQR</span>
            </div>

            <FaTimes className={styles.closeIcon} onClick={() => setOpen(false)} />
          </div>

          {/* MENU */}
          <div className={styles.menuSection}>
            <div className={styles.menuItem}>
              <FaCalendarAlt />
              <span>My Events</span>
            </div>
          </div>
        </div>

        {/* BOTTOM PROFILE */}
        <div className={styles.profile}>
          <div className={styles.avatar}>{initials}</div>
          <div>
            <p>{user?.name || 'User'}</p>
            <span>{user?.role
               ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                 : "Organizer"}</span>
          </div>

          <button
            className={styles.logoutButton}
            onClick={() => setShowLogoutConfirm(true)}
            aria-label="Log out"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
              {/* Title */}
              <div className={styles.titleRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                  <div>
                    <h1>My Events</h1>
                    <p>Manage your events and track attendance</p>
                  </div>
                </div>

                <button
                  className={styles.createBtn}
                  onClick={() => navigate("/events/create")}
                >
                  <FaPlus className={styles.createIcon} aria-hidden="true" />
                  <span className={styles.createText}>Create Event</span>
                </button>
              </div>

              {/* Search */}
              <div className={styles.searchContainer}>
                <input
                  type="text"
                  placeholder="Search events..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className={styles.filterBtn}>Filter</button>
              </div>

              {/* Upcoming */}
              <h2 className={styles.sectionTitle}>
                <FaCalendarAlt className={styles.sectionIcon} />
                Upcoming Events
              </h2>

              {loading ? (
                <div className={styles.cardsGrid}>
                  {[1,2].map((i) => (
                    <div key={i} className={styles.skeletonCard}>
                      <div className={styles.skelTitle} />
                      <div className={styles.skelMeta} />
                      <div className={styles.skelRow} />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <p className={styles.error}>{error}</p>
              ) : (
                <div className={styles.cardsGrid}>
                  {upcomingEvents.map((ev) => (
                    <EventCard
                      id={ev.id || ev._id}
                      key={ev.id || ev._id || ev.title}
                      title={ev.title}
                      date={formatDate(ev.date)}
                      location={ev.location || ev.venue}
                      participants={ev.participants ?? ev.attendees ?? ev.registeredCount ?? 0}
                      sessions={Array.isArray(ev.sessions) ? ev.sessions.length : ev.sessions ?? 0}
                      volunteers={ev.volunteers ?? ev.volunteersCount ?? 0}
                      status={ev.status || (new Date(ev.date) > new Date() ? 'upcoming' : 'completed')}
                    />
                  ))}
                </div>
              )}

              {/* Empty state for upcoming */}
              {!loading && !error && upcomingEvents.length === 0 && (
                <div className={styles.emptyState}>
                  <p>No upcoming events found.</p>
                  <button className={styles.createBtn} onClick={() => navigate('/events/create')}>Create Event</button>
                </div>
              )}

              {/* Past */}
              <h2 className={styles.sectionTitle}>
                <FaClock className={styles.sectionIcon} />
                Past Events
              </h2>

              <div className={styles.cardsGrid}>
                {loading ? (
                  <p />
                ) : pastEvents.length === 0 ? (
                  <div className={styles.emptyPast}>
                    <FaClock className={styles.emptyPastIcon} aria-hidden="true" />
                    <p>No past events yet.</p>
                  </div>
                ) : (
                  pastEvents.map((ev) => (
                    <EventCard
                      id={ev.id || ev._id}
                      key={ev.id || ev._id || ev.title}
                      title={ev.title}
                      date={formatDate(ev.date)}
                      location={ev.location || ev.venue}
                      participants={ev.participants ?? ev.attendees ?? ev.registeredCount ?? 0}
                      sessions={Array.isArray(ev.sessions) ? ev.sessions.length : ev.sessions ?? 0}
                      volunteers={ev.volunteers ?? ev.volunteersCount ?? 0}
                      status={ev.status || (new Date(ev.date) > new Date() ? 'upcoming' : 'completed')}
                    />
                  ))
                )}
              </div>
        </div>
      </div>

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
    </>
  );
};

export default OrganizerDashboard;