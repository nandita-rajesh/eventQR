import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaQrcode,
  FaCalendarAlt,
  FaTimes
} from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import styles from "./CreateEvent.module.css";
import Icon from "../../../shared/components/Icon";

export default function CreateEvent() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const initials = (user?.name || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newEvent = {
        id: Date.now(),
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.venue,
        participants: 0,
        sessions: 0,
        volunteers: 0,
        status: "upcoming",
    };

    // get old events
    const existingEvents =
        JSON.parse(localStorage.getItem("events")) || [];

    // save updated list
    localStorage.setItem(
        "events",
        JSON.stringify([...existingEvents, newEvent])
    );

    navigate("/dashboard");
    };

  return (
    <div className={styles.page}>

        {/* MOBILE TOPBAR */}
        <header className={styles.mobileTopbar}>
        <div className={styles.leftHeader}>

            <HiOutlineMenu
              className={styles.mobileMenuIcon}
              onClick={() => setOpen(true)}
            />

            <span className={styles.mobileTitle}>
            EventQR
            </span>

        </div>
        </header>

        {/* OVERLAY */}
        {open && (
        <div
            className={styles.overlay}
            onClick={() => setOpen(false)}
        />
        )}

        {/* SIDEBAR */}
        <div className={`${styles.sidebar} ${open ? styles.show : ""}`}>

        {/* TOP */}
        <div>

            <div className={styles.sidebarTop}>

                <div className={styles.logoRow}>
                    <FaQrcode className={styles.logoIconBlue} />

                    <span className={styles.logoTextDark}>
                    EventQR
                    </span>
                </div>

                <FaTimes
                    className={styles.closeIcon}
                    onClick={() => setOpen(false)}
                />

            </div>

            {/* MENU */}
            <div className={styles.menuSection}>

            <div
                className={styles.menuItem}
                onClick={() => navigate("/dashboard")}
                >
                <FaCalendarAlt />
                <span>My Events</span>
            </div>

            </div>

        </div>

        {/* PROFILE */}
        <div className={styles.profile}>

            <div className={styles.avatar}>
            {initials}
            </div>

            <div>
            <p>{user?.name || "User"}</p>

            <span>
                {user?.role
                ? user.role.charAt(0).toUpperCase() +
                    user.role.slice(1)
                : "Organizer"}
            </span>
            </div>

            <button
                className={styles.logoutButton}
                onClick={() => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                }}
                aria-label="Log out"
            >
                <Icon name="logout" size={18} />
            </button>

        </div>

        </div>
        

        <div className={styles.desktopContent}>

        {/* Back */}
        <header
            className={styles.topbar}
            onClick={() => navigate("/dashboard")}
        >
            <button className={styles.backButton}>
            <FaArrowLeft />
            </button>

            <span className={styles.topbarTitle}>
            Back to Events
            </span>
        </header>

        {/* Form Card */}
        <div className={styles.card}>

            <h1>Create New Event</h1>

            <p>Fill in the details to create your event</p>

            <form onSubmit={handleSubmit}>

            <div className={styles.formGroup}>
                <label>Event Name *</label>

                <input
                type="text"
                name="title"
                placeholder="e.g., Tech Conference 2026"
                value={formData.title}
                onChange={handleChange}
                required
                />
            </div>

            <div className={styles.formGroup}>
                <label>Description</label>

                <textarea
                name="description"
                placeholder="Describe your event..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
                />
            </div>

            {/* DATE + VENUE */}
            <div className={styles.doubleRow}>

                <div className={styles.formGroup}>
                <label>Event Date *</label>

                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />
                </div>

                <div className={styles.formGroup}>
                <label>Venue *</label>

                <input
                    type="text"
                    name="venue"
                    placeholder="e.g., Convention Center"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                />
                </div>

            </div>

            <div className={styles.buttonRow}>

                <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => navigate(-1)}
                >
                Cancel
                </button>

                <button
                type="submit"
                className={styles.createBtn}
                >
                Create Event
                </button>

            </div>

            </form>

        </div>
        </div>
        </div>
    );
}