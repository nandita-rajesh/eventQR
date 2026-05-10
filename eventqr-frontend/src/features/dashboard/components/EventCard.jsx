import React from "react";
import styles from "./EventCard.module.css";
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const EventCard = ({
  id,
  title,
  date,
  location,
  participants,
  sessions,
  volunteers,
  status,
}) => {

  const navigate = useNavigate();

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/events/${id}`)}
    >

      <div className={styles.top}>
        <h3>{title}</h3>

        <span className={`${styles.badge} ${styles[status]}`}>
          {status}
        </span>
      </div>

      <div className={styles.meta}>
        <div className={styles.date}>
          <FaCalendarAlt /> {date}
        </div>

        <p>{location}</p>
      </div>

      <div className={styles.divider}></div>

      <div className={styles.stats}>

        <div>
          <h2>{participants}</h2>
          <p>Participants</p>
        </div>

        <div>
          <h2>{sessions}</h2>
          <p>Sessions</p>
        </div>

        <div>
          <h2>{volunteers}</h2>
          <p>Volunteers</p>
        </div>

      </div>

    </div>
  );
};

export default EventCard;