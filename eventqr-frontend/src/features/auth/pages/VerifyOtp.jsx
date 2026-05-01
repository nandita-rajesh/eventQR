import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOtp } from "../../../shared/api/authApi";
import styles from "./VerifyOtp.module.css";
import { FaShieldAlt, FaQrcode } from "react-icons/fa";

const VerifyOtp = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

// handle input change
const handleChange = (value, index) => {
  if (!/^[0-9]?$/.test(value)) return;

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

  try {
    const res = await verifyOtp({
      email: email,
      otp: finalOtp
    });

    console.log("OTP verified:", res);

    alert("Account verified!");

    navigate("/"); // go to login

  } catch (err) {
    console.error(err.response?.data);
    alert(err.response?.data?.error || "Invalid OTP");
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

        {/* OTP Inputs */}
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
              />
            ))}
          </div>

          <button
            className={styles.button}
            disabled={otp.join("").length !== 6}
          >
            Verify & Continue
          </button>
        </form>

        <p className={styles.resend}>
          Didn’t receive the code? <span>Resend OTP</span>
        </p>

        <p className={styles.back}>
          ← Back to Registration
        </p>

      </div>
    </div>
  );
};

export default VerifyOtp;