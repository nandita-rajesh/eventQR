import React, { useState, useEffect, useRef } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Login.module.css";
import otpStyles from "./VerifyOtp.module.css";
import { FaQrcode, FaLock, FaShieldAlt, FaCheckCircle } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword, resendOtp } from "../../../shared/api/authApi";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // resend state
  const [resendLoading, setResendLoading] = useState(false);
  const [resendError, setResendError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);

  const timerRef = useRef(null);

  const [success, setSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);

  useEffect(() => {
    if (!email) navigate("/forgot-password");
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (cooldownRef.current) clearInterval(cooldownRef.current);
    };
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) return setError("Enter the 6-digit OTP");
    if (!password) return setError("Enter a new password");
    if (password !== confirm) return setError("Passwords do not match");

    try {
      setLoading(true);
      await resetPassword({ email, otp: finalOtp, newPassword: password });
      // show success UI and redirect countdown
      setSuccess(true);
      setRedirectCountdown(3);
      timerRef.current = setInterval(() => {
        setRedirectCountdown((c) => {
          if (c <= 1) {
            clearInterval(timerRef.current);
            timerRef.current = null;
            navigate("/login");
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      const msg = err.response?.data?.error || "Could not reset password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // OTP input handlers (6 inputs)
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    setError("");

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
        return;
      }
      if (index > 0) {
        document.getElementById(`otp-${index - 1}`)?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    const pasteRaw = e.clipboardData?.getData("text") || "";
    const paste = pasteRaw.replace(/\s+/g, "").slice(0, 6);
    if (!/^\d+$/.test(paste)) return;

    const newOtp = Array(6).fill("");
    paste.split("").forEach((ch, i) => {
      newOtp[i] = ch;
    });
    setOtp(newOtp);

    const focusIndex = Math.min(paste.length - 1, 5);
    if (focusIndex >= 0) {
      document.getElementById(`otp-${focusIndex}`)?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) return;
    if (cooldown > 0) return;

    setResendError("");
    setResendSuccess(false);
    setResendLoading(true);

    try {
      await resendOtp({ email, type: "reset" });
      setResendSuccess(true);
      setCooldown(30);
      cooldownRef.current = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(cooldownRef.current);
            cooldownRef.current = null;
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      setResendError(err.response?.data?.error || "Could not resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthCard>
      <div className={styles.logoRow}>
        <FaQrcode className={styles.logoIcon} />
        <h1>EventQR</h1>
      </div>

      <div className={otpStyles.iconContainer}>
        <div className={success ? otpStyles.iconCircleSuccess : otpStyles.iconCircle}>
          {success ? <FaCheckCircle /> : <FaShieldAlt />}
        </div>
      </div>

      <h2 className={styles.title}>{success ? 'Password Reset' : 'Reset Password'}</h2>
      {!success && (
        <p className={styles.subtitle}>Enter the OTP sent to <strong>{email}</strong> and choose a new password</p>
      )}

      {!success ? (
        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="otp">OTP</label>
          <div className={otpStyles.otpContainer} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                aria-label={`OTP digit ${index + 1}`}
                autoFocus={index === 0}
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={otpStyles.otpInput}
                disabled={loading}
              />
            ))}
          </div>

          <label htmlFor="password">New Password</label>
          <AuthInput
            id="password"
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<FaLock />}
            disabled={loading}
          >
            <button
              type="button"
              className={styles.eye}
              onClick={() => setShowPassword(s => !s)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </AuthInput>

          <label htmlFor="confirm">Confirm Password</label>
          <AuthInput
            id="confirm"
            type={showPassword ? 'text' : 'password'}
            name="confirm"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            icon={<FaLock />}
            disabled={loading}
          />

          {error && <p className={styles.error}>{error}</p>}

          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      ) : (
        <div className={otpStyles.successContainer}>
          <p className={otpStyles.successTitle}>Password reset successfully</p>
          <p className={otpStyles.successSubtitle}>You will be redirected to login in {redirectCountdown}s</p>
          <div style={{ marginTop: 12 }}>
            <button className={styles.button} onClick={() => navigate('/login')}>
              Back to Login
            </button>
          </div>
        </div>
      )}

      {!success && (
        <div style={{ textAlign: 'center', marginTop: 12 }}>
          <p className={otpStyles.resend}>
            Didn’t receive the code?{' '}
            <button type="button" className={otpStyles.link} onClick={handleResend} disabled={resendLoading || cooldown > 0}>
              {resendLoading ? 'Sending...' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </button>
          </p>
          {resendSuccess && <p className={otpStyles.successSmall}>OTP sent to {email}</p>}
          {resendError && <p className={otpStyles.error}>{resendError}</p>}
        </div>
      )}

      {!success && (
        <p className={styles.footer}>
          Remembered? <span onClick={() => navigate('/login')}>Sign in</span>
        </p>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
