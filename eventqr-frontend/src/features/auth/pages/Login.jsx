// ...existing code...
import React, { useState, useRef, useEffect } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Login.module.css";
import { FaQrcode, FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser, resendOtp } from "../../../shared/api/authApi";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // resend state
  const [showResend, setShowResend] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendError, setResendError] = useState("");

  const navigate = useNavigate();
  const emailRef = useRef(null);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setErrors((prev) => ({
      ...prev,
      [name]: "",
      general: "",
    }));

    setForm({
      ...form,
      [name]: value,
    });
  };

  const isValid =
    form.email && /\S+@\S+\.\S+/.test(form.email) && form.password;

  const handleResend = async () => {
    setResendError("");
    if (!form.email) {
      setErrors((prev) => ({ ...prev, email: "Enter email to resend code" }));
      emailRef.current?.focus();
      return;
    }

    try {
      setResending(true);
      await resendOtp({ email: form.email , type:"verify"});
      // navigate to verify page with email in state
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      let message = "Could not send OTP";
      if (err.response?.data?.error) message = err.response.data.error;
      setResendError(message);
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // focus first invalid field
      if (newErrors.email) emailRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      setShowResend(false);

      const res = await loginUser(form);

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      // role-based redirect
      if (res.user.role === "organizer") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard/volunteer");
      }

    } catch (err) {
      let message = "Invalid credentials";

      if (err.response?.data?.error) {
        message = err.response.data.error;
      }

      // if backend tells user is unverified, show resend CTA
      if (
        typeof message === "string" &&
        message.toLowerCase().includes("verify")
      ) {
        setShowResend(true);
      }

      setErrors({ general: message });
      // clear password
      setForm((prev) => ({ ...prev, password: "" }));
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

      <h2 className={styles.title}>Welcome Back</h2>
      <p className={styles.subtitle}>
        Sign in to manage your events
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="email">Email Address</label>
        <AuthInput
          id="email"
          ref={emailRef}
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon={<FaEnvelope />}
          disabled={loading}
          autoComplete="email"
          autoFocus
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}

        <label htmlFor="password">Password</label>
        <div className={styles.passwordWrapper}>
          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            icon={<FaLock />}
            disabled={loading}
            autoComplete="current-password"
            aria-invalid={!!errors.password}
          />

          <span
            className={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && (
          <p className={styles.error}>{errors.password}</p>
        )}

        {errors.general && (
          <div className={styles.errorRow} role="alert" aria-live="assertive">
            <span className={styles.errorText}>{errors.general}</span>

            {showResend && (
              <button
                type="button"
                className={styles.inlineAction}
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? "Sending..." : "Verify"}
              </button>
            )}
          </div>
        )}

        {resendError && <p className={styles.error}>{resendError}</p>}
        
        <div className={styles.row}>
          <button type="button" className={styles.linkButton} onClick={() => navigate('/forgot-password')}>Forgot password?</button>
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={!isValid || loading}
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <p className={styles.footer}>
        Don’t have an account?{" "}
        <span onClick={() => navigate("/signup")}>Sign up</span>
      </p>

      <p className={styles.back} onClick={() => navigate("/")}>
        ← Back to Home
      </p>
    </AuthCard>
  );
};

export default Login;
// ...existing code...