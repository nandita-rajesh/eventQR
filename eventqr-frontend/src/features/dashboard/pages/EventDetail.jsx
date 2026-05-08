import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import Icon from "../../../shared/components/Icon";
import { assignedEvents } from "../../../shared/utils/mockData";

import styles from "./EventDetail.module.css";

export default function EventDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const event = assignedEvents.find(
    (e) => e.id === Number(id)
  );

  if (!event) {
    return <div>Event not found</div>;
  }

  return (
    <div className={styles.page}>
      {/* MOBILE HEADER */}

      <header className={styles.mobileHeader}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
        >
          ←
        </button>

        <div className={styles.headerInfo}>
          <h2>{event.name}</h2>
          <span>Volunteer</span>
        </div>

        <button className={styles.logoutBtn}>
          <Icon name="logout" size={18} />
        </button>
      </header>

      {/* EVENT CARD */}

      <section className={styles.eventCard}>
        <div className={styles.eventTop}>
          <div>
            <h1 className={styles.eventTitle}>
              {event.name}
            </h1>

            <div className={styles.metaRow}>
              <Icon name="calendar" size={16} />
              <span>{event.date}</span>
            </div>

            <div className={styles.metaRow}>
              <Icon name="location" size={16} />
              <span>{event.venue}</span>
            </div>
          </div>

          <button
            className={styles.scanBtn}
            onClick={() => navigate(`/scan/${event.id}`)}
          >
            <Icon name="qr" size={18} />
            <span>Scan QR</span>
          </button>
        </div>

        {/* STATS */}

        <div className={styles.stats}>
          <div>
            <h3>5</h3>
            <span>Total</span>
          </div>

          <div>
            <h3 className={styles.green}>2</h3>
            <span>Checked In</span>
          </div>

          <div>
            <h3 className={styles.gray}>3</h3>
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
        />

        <div className={styles.participantTable}>
            {/* HEADER */}

            <div className={styles.tableHead}>
                <span>Name</span>
                <span>Email</span>
                <span>Phone</span>
                <span>Status</span>
            </div>

            {/* ROWS */}

            <div className={styles.tableRow}>
                <span>John Smith</span>
                <span>john@example.com</span>
                <span>+1 555-0101</span>

                <span className={styles.checkedIn}>
                Checked In
                </span>
            </div>

            <div className={styles.tableRow}>
                <span>Sarah Johnson</span>
                <span>sarah@example.com</span>
                <span>+1 555-0102</span>

                <span className={styles.checkedIn}>
                Checked In
                </span>
            </div>

            <div className={styles.tableRow}>
                <span>Michael Lee</span>
                <span>michael@example.com</span>
                <span>+1 555-0103</span>

                <span className={styles.pending}>
                Not Checked In
                </span>
            </div>
            </div>
      </section>
    </div>
  );
}