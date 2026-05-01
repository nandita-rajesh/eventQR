import React from "react";
import styles from "./EventCard.module.css";

const EventCard = ({ title, date, participants, attendance, status }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>{title}</h3>
        <span className={`${styles.status} ${styles[status]}`}>
            {status}
        </span>
      </div>

      <p className={styles.date}>{date}</p>

      <div className={styles.stats}>
        <span>Participants: {participants}</span>
        <span>Attendance: {attendance}</span>
      </div>
    </div>
  );
};

export default EventCard;