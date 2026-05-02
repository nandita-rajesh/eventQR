import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../shared/api/authApi";
import styles from "./VerifyOtp.module.css";
import { FaShieldAlt, FaQrcode } from "react-icons/fa";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const timerRef = useRef(null);

  const email = location.state?.email;

  // redirect if missing email and cleanup timer on unmount
  useEffect(() => {
    if (!email) {
      navigate("/signup");
      return;
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [email, navigate]);

  // handle input change
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    setError(""); // clear error

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      // clear current and move focus back when appropriate
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

    // merge paste into a fixed-length 6 array
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

  // handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const finalOtp = otp.join("");

    // Show error if not 6 digits
    if (finalOtp.length !== 6) {
      setError("Enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await verifyOtp({
        email,
        otp: finalOtp,
      });

      // Hide inputs + show success
      setSuccess(true);

      // Redirect after 3 sec (store timer to clear on unmount)
      timerRef.current = setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      let message = "Invalid OTP";

      if (err.response?.data?.error) {
        message = err.response.data.error;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logoRow}>
          <FaQrcode className={styles.logoIcon} />
          <h1>EventQR</h1>
        </div>

        {/* Icon */}
        <div className={styles.iconCircle}>
          <FaShieldAlt />
        </div>

        <h2 className={styles.title}>Verify Your Email</h2>
        <p className={styles.subtitle}>
          We've sent a 6-digit code to <br />
          <span>{email}</span>
        </p>

        {success ? (
          <div className={styles.successContainer}>
            <h2 className={styles.successTitle}>Verified</h2>
            <p className={styles.successSubtitle}>
              Redirecting to login page...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.otpContainer} onPaste={handlePaste}>
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
                  className={styles.otpInput}
                  disabled={loading}
                />
              ))}
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button className={styles.button} disabled={loading}>
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        <p className={styles.resend}>
          Didn’t receive the code? <span>Resend OTP</span>
        </p>

        <p className={styles.back} onClick={() => navigate("/signup")}>
          ← Back to Registration
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;