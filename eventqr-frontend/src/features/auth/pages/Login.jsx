import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Login.module.css";
import { FaQrcode, FaEnvelope, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../shared/api/authApi";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

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
      return;
    }

    try {
      setLoading(true);
      setErrors({});

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

      setErrors({ general: message });

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
        
        <label>Email Address</label>
        <AuthInput
          type="email"
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon={<FaEnvelope />}
          disabled={loading}
        />
        {errors.email && (
          <p className={styles.error}>{errors.email}</p>
        )}

        <label>Password</label>
        <AuthInput
          type="password"
          name="password"
          placeholder="••••••••"
          value={form.password}
          onChange={handleChange}
          icon={<FaLock />}
          disabled={loading}
        />
        {errors.password && (
          <p className={styles.error}>{errors.password}</p>
        )}

        {errors.general && (
          <p className={styles.error}>{errors.general}</p>
        )}

        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input type="checkbox" disabled={loading} /> Remember me
          </label>
          <span className={styles.link}>Forgot password?</span>
        </div>

        <button className={styles.button} disabled={loading}>
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