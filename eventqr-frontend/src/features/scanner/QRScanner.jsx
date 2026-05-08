import React from "react";
import { useNavigate } from "react-router-dom";

import Icon from "../../shared/components/Icon";
import styles from "./QRScanner.module.css";

export default function QRScanner() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HEADER */}

      <header className={styles.mobileHeader}>
        <button
            className={styles.backLink}
            onClick={() => navigate(-1)}
        >
            ←
            <span>Back to Event</span>
        </button>

        <div className={styles.headerCenter}>
            <Icon name="qr" size={18} color="#2563eb" />

            <span className={styles.headerTitle}>
            Tech Conference 2026
            </span>
        </div>
      </header>

      {/* SCANNER CARD */}

      <section className={styles.scannerCard}>
        <h1 className={styles.sectionTitle}>
          Scan QR Code
        </h1>

        {/* CAMERA AREA */}

        <div className={styles.cameraArea}>
          <div className={styles.cameraIcon}>
            <Icon
                name="camera"
                size={72}
                color="#475569"
            />
          </div>

          <span>Camera not active</span>
        </div>

        {/* BUTTON */}

        <button className={styles.cameraBtn}>
          <Icon
            name="video"
            size={18}
            color="#ffffff"
            />
          <span>Start Camera</span>
        </button>

        <p className={styles.cameraText}>
          Grant camera permission to scan QR codes
        </p>

        {/* SESSION */}

        <div className={styles.sessionSection}>
          <label>Current Session</label>

          <select className={styles.sessionSelect}>
            <option>Opening Keynote</option>
            <option>Workshop A</option>
            <option>Networking Session</option>
          </select>
        </div>
      </section>

      {/* RECENT SCANS */}

      <section className={styles.infoCard}>
        <h2 className={styles.cardTitle}>
          Recent Scans
        </h2>

        <div className={styles.scanItem}>
          <div className={styles.scanLeft}>
            <div className={styles.successIcon}>
              ✓
            </div>

            <div>
              <h3>John Smith</h3>
              <span>Opening Keynote</span>
            </div>
          </div>

          <span className={styles.scanTime}>
            9:15 AM
          </span>
        </div>

        <div className={styles.scanItem}>
          <div className={styles.scanLeft}>
            <div className={styles.successIcon}>
              ✓
            </div>

            <div>
              <h3>Sarah Johnson</h3>
              <span>Opening Keynote</span>
            </div>
          </div>

          <span className={styles.scanTime}>
            9:12 AM
          </span>
        </div>
      </section>

      {/* STATS */}

      <section className={styles.infoCard}>
        <h2 className={styles.cardTitle}>
          Today's Statistics
        </h2>

        <div className={styles.statsRow}>
          <span>Total Scans</span>
          <strong>2</strong>
        </div>

        <div className={styles.statsRow}>
          <span>Successful</span>
          <strong className={styles.green}>2</strong>
        </div>

        <div className={styles.statsRow}>
          <span>Failed</span>
          <strong className={styles.red}>0</strong>
        </div>
      </section>
    </div>
  );
}