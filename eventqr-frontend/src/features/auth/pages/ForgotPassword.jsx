import React, { useState, useRef, useEffect } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Login.module.css";
import { FaQrcode, FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../../../shared/api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Enter your email address");
      emailRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      await forgotPassword({ email });

      // on success backend returns { message: 'OTP Sent to mail' }
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      const msg = err.response?.data?.error || "Could not send OTP";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className={styles.logoRow}>
        <FaQrcode className={styles.logoIcon} />
        <h1>EventQR</h1>
      </div>

      <h2 className={styles.title}>Forgot Password</h2>
      <p className={styles.subtitle}>Enter your email and we'll send a reset code</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <AuthInput
          id="email"
          ref={emailRef}
          type="email"
          name="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<FaEnvelope />}
          disabled={loading}
          autoComplete="email"
        />

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.button} type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>

      <p className={styles.footer}>
        Remembered password? <span onClick={() => navigate('/login')}>Sign in</span>
      </p>
    </AuthCard>
  );
};

export default ForgotPassword;
