import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaQrcode,
    FaCalendarAlt,
} from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import styles from "./CreateEvent.module.css";
import Icon from "../../../shared/components/Icon";
import { createEvent } from '../../../shared/api/eventsApi';


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
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
        // all fields mandatory: title, description, date, venue
        if (!formData.title || !formData.description || !formData.date || !formData.venue) {
            setError('All fields are required');
            return;
        }

        // call API to create event
        (async () => {
            setSubmitting(true);
            setError('');
            try {
                const payload = {
                    title: formData.title,
                    description: formData.description,
                    date: formData.date,
                    venue: formData.venue,
                };

                const res = await createEvent(payload);
                // expect 201 and response message; redirect to dashboard
                navigate('/dashboard');
            } catch (err) {
                const msg = err.response?.data?.error || err.message || 'Could not create event';
                setError(msg);
            } finally {
                setSubmitting(false);
            }
        })();
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
            {error && <div style={{color: '#dc2626', marginBottom: 12}}>{error}</div>}

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
                <label>Description *</label>

                <textarea
                name="description"
                placeholder="Describe your event..."
                rows="5"
                value={formData.description}
                onChange={handleChange}
                required
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
                disabled={submitting}
                >
                {submitting ? 'Creating…' : 'Create Event'}
                </button>

            </div>

            </form>

        </div>
        </div>
        </div>
    );
}