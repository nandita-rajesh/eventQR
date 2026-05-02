import React, { useEffect } from "react";
import styles from "./VolunteerDashboard.module.css";
import { useNavigate } from "react-router-dom";

const VolunteerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "volunteer") {
      navigate("/dashboard");
    }
  }, []);

  return (
    <div className={styles.container}>
      <h1>Volunteer Dashboard</h1>
      <p>Coming soon…</p>
    </div>
  );
};

export default VolunteerDashboard;