import React from "react";
import styles from "./QuickAction.module.css";

const QuickAction = ({ icon, text, active }) => {
  return (
    <div className={`${styles.card} ${active ? styles.active : ""}`}>
      <div className={styles.icon}>{icon}</div>
      <p>{text}</p>
    </div>
  );
};

export default QuickAction;