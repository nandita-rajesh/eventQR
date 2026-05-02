import React, { useState } from "react";
import styles from "./OrganizerDashboard.module.css";
import EventCard from "../components/EventCard";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaQrcode,
  FaTimes,
  FaCalendarAlt,
  FaClock
} from "react-icons/fa";


const OrganizerDashboard = () => {
  const [open, setOpen] = useState(false);
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
  }, [navigate]);
  
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || user.role !== "organizer") {
    return null;
  }

  return (
    <>
      {/* ================= HEADER ================= */}
      <div className={styles.topHeader}>
        <div className={styles.leftHeader}>
          <FaBars
            className={styles.menuIcon}
            onClick={() => setOpen(true)}
          />

          <div className={styles.logoRow}>
            <FaQrcode className={styles.logoIcon} />
            <span className={styles.logoText}>EventQR</span>
          </div>
        </div>
      </div>

      {/* ================= SIDEBAR ================= */}
      {open && (
        <div
          className={styles.overlay}
          onClick={() => setOpen(false)}
        />
      )}

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
          <div className={styles.avatar}>JD</div>
          <div>
            <p>John Doe</p>
            <span>Organizer</span>
          </div>
        </div>

      </div>

      {/* ================= CONTENT ================= */}
      <div className={styles.container}>
        {/* Title */}
        <div className={styles.titleRow}>
          <div>
            <h1>My Events</h1>
            <p>Manage your events and track attendance</p>
          </div>

          <button className={styles.createBtn}>
            + Create Event
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search events..."
            className={styles.searchInput}
          />
          <button className={styles.filterBtn}>Filter</button>
        </div>

        {/* Upcoming */}
        <h2 className={styles.sectionTitle}>
          <FaCalendarAlt className={styles.sectionIcon} />
          Upcoming Events
        </h2>

        <EventCard
          title="AI Summit 2026"
          date="June 20, 2026"
          location="Grand Hotel"
          participants={0}
          sessions={4}
          volunteers={0}
          status="upcoming"
        />

        <EventCard
          title="Tech Conference 2026"
          date="May 15, 2026"
          location="Convention Center"
          participants={450}
          sessions={3}
          volunteers={5}
          status="upcoming"
        />

        {/* Past */}
        <h2 className={styles.sectionTitle}>
          <FaClock className={styles.sectionIcon} />
          Past Events
        </h2>

        <EventCard
          title="Startup Pitch Day"
          date="May 10, 2026"
          location="Innovation Hub"
          participants={120}
          sessions={2}
          volunteers={3}
          status="completed"
        />

        <EventCard
          title="Workshop: React Fundamentals"
          date="May 5, 2026"
          location="Tech Academy"
          participants={75}
          sessions={1}
          volunteers={2}
          status="completed"
        />
      </div>
    </>
  );
};

export default OrganizerDashboard;