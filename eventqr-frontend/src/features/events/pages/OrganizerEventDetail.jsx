import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaUpload,
  FaChartBar,
  FaUserFriends,
  FaQrcode,
  FaTimes,
} from "react-icons/fa";
import { HiOutlineMenu } from "react-icons/hi";
import styles from "./OrganizerEventDetail.module.css";
import Icon from "../../../shared/components/Icon";


export default function OrganizerEventDetail() {

  const navigate = useNavigate();
  
  const [open, setOpen] = React.useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const initials = (user?.name || "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const { id } = useParams();

  const events =
    JSON.parse(localStorage.getItem("events")) || [];

  const event = events.find(
    (e) => String(e.id) === String(id)
  );

  if (!event) {
    return (
      <div style={{ padding: 40 }}>
        Event not found
      </div>
    );
  }

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

      {/* BACK */}
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

      {/* MAIN CARD */}
      <div className={styles.card}>

        <div className={styles.titleRow}>

          <div>

            <h1>{event.title}</h1>

            <div className={styles.metaRow}>

              <div className={styles.metaItem}>
                <FaCalendarAlt />
                <span>{event.date}</span>
              </div>

              <div className={styles.metaItem}>
                <FaMapMarkerAlt />
                <span>{event.location}</span>
              </div>

            </div>

          </div>

          <button className={styles.editBtn}>
            Edit Event
          </button>

        </div>

        <p className={styles.description}>
          {event.description}
        </p>

        {/* STATS */}
        <div className={styles.statsGrid}>

          <div className={styles.statCard}>
            <h2>{event.participants || 0}</h2>
            <p>Total Participants</p>
          </div>

          <div className={styles.statCard}>
            <h2>{event.participants || 0}</h2>
            <p>Registered</p>
          </div>

          <div className={styles.statCard}>
            <h2>{event.participants || 0}</h2>
            <p>Attended</p>
          </div>

          <div className={styles.statCard}>
            <h2>100%</h2>
            <p>Attendance Rate</p>
          </div>

        </div>

      </div>

      {/* ACTIONS */}
      <div className={styles.actionGrid}>

        <div className={styles.actionCard}>
          <FaUsers className={styles.actionIcon} />

          <h3>Manage Participants</h3>

          <p>
            View and manage participant list
          </p>
        </div>

        <div className={styles.actionCard}>
          <FaUpload className={styles.actionIcon} />

          <h3>Upload CSV</h3>

          <p>
            Bulk import participants
          </p>
        </div>

        <div className={styles.actionCard}>
          <FaUserFriends className={styles.actionIcon} />

          <h3>Manage Volunteers</h3>

          <p>
            Add volunteers for this event
          </p>
        </div>

        <div className={styles.actionCard}>
          <FaChartBar className={styles.actionIcon} />

          <h3>Attendance Reports</h3>

          <p>
            View detailed analytics
          </p>
        </div>

      </div>

    </div>
  );
}