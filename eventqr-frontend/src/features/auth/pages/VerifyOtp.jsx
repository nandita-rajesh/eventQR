import { useState } from "react";
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

  const email = location.state?.email;

  // handle input change
  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    setError(""); // clear error

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.split("");
    setOtp(newOtp);

    document.getElementById(`otp-${newOtp.length - 1}`).focus();
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

      const res = await verifyOtp({
        email,
        otp: finalOtp,
      });

      // Hide inputs + show success
      setSuccess(true);

      // Redirect after 3 sec
      setTimeout(() => {
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

            <button
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify & Continue"}
            </button>
          </form>
        )}

        <p className={styles.resend}>
          Didn’t receive the code? <span>Resend OTP</span>
        </p>

        <p
          className={styles.back}
          onClick={() => navigate("/signup")}
        >
          ← Back to Registration
        </p>

      </div>
    </div>
  );
};

export default VerifyOtp;