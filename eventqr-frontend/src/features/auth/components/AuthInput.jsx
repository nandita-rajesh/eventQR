import React from "react";
import styles from "./AuthInput.module.css";

const AuthInput = ({ type, placeholder, value, onChange, name, icon }) => {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>{icon}</span>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={styles.input}
      />
    </div>
  );
};

export default AuthInput;