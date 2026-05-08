import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../../shared/components/Icon";
import { assignedEvents } from "../../../shared/utils/mockData";

import styles from "./VolunteerDashboard.module.css";

export default function VolunteerDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <div className={styles.avatar}>N</div>

            <div>
              <div className={styles.profileName}>Nandita</div>
              <div className={styles.profileRole}>Volunteer</div>
            </div>
          </div>

          <button className={styles.logoutButton}>
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
          {assignedEvents.map((event) => (
            <article key={event.id} className={styles.eventCard}>
              <div className={styles.eventCardHead}>
                <h3 className={styles.eventName}>{event.name}</h3>

                <span
                  className={`${styles.pill} ${
                    styles[`pill${event.status}`]
                  }`}
                >
                  {event.status}
                </span>
              </div>

              <div className={styles.eventMeta}>
                <div className={styles.eventMetaRow}>
                  <Icon name="calendar" size={16} color="#64748b" />
                  <span>{event.date}</span>
                </div>

                <div className={styles.eventMetaRow}>
                  <Icon name="location" size={16} color="#64748b" />
                  <span>{event.venue}</span>
                </div>
              </div>

              <button
                className={styles.btnPrimary}
                onClick={() =>
                  navigate(`/volunteer/event/${event.id}`)
                }
              >
                View Event
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}