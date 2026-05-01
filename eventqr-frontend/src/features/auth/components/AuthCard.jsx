import React from "react";
import styles from "../pages/Login.module.css";

const AuthCard = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {children}
      </div>
    </div>
  );
};

export default AuthCard;