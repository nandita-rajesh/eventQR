import React from "react";
import styles from "./StatCard.module.css";

const StatCard = ({ title, value, subtext, icon, color }) => {
  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span>{title}</span>
        <div className={styles.icon} style={{ background: color }}>
          {icon}
        </div>
      </div>

      <h2 className={styles.value}>{value}</h2>
      <p className={styles.subtext}>{subtext}</p>
    </div>
  );
};

export default StatCard;