import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Signup.module.css";
import { registerUser } from "../../../shared/api/authApi";
import { useNavigate } from "react-router-dom";

import {
  FaQrcode,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";

const Signup = () => {
  const [role, setRole] = useState("organizer");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;

    // clear only that field error
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

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Name
    if (!form.name) newErrors.name = "Full name is required";

    // Email
    if (!form.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = "Enter a valid email";
    }

    // Phone
    if (!form.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(form.phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        "Password must be 8+ chars with uppercase, lowercase, number & symbol";
    }

    // Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        phoneNumber: form.phone,
        role,
      };

      const res = await registerUser(payload);

      navigate("/verify-otp", {
        state: { email: form.email },
      });

    } catch (err) {
      let message = "Something went wrong";

      if (err.response?.data?.error === "User already exists") {
        message = "An account with this email already exists.";
      } else if (err.response?.data?.error) {
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

      <h2 className={styles.title}>Create Account</h2>
      <p className={styles.subtitle}>
        Start managing events with ease
      </p>

      <p className={styles.labelTop}>Register as</p>

      <div className={styles.toggle}>
        <button
          type="button"
          className={role === "organizer" ? styles.active : ""}
          onClick={() => setRole("organizer")}
        >
          Organizer
        </button>

        <button
          type="button"
          className={role === "volunteer" ? styles.active : ""}
          onClick={() => setRole("volunteer")}
        >
          Volunteer
        </button>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Name */}
        <label>Full Name</label>
        <AuthInput
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          icon={<FaUser />}
        />
        {errors.name && <p className={styles.error}>{errors.name}</p>}

        {/* Email */}
        <label>Email Address</label>
        <AuthInput
          name="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          icon={<FaEnvelope />}
        />
        {errors.email && <p className={styles.error}>{errors.email}</p>}

        {/* Phone */}
        <label>Phone Number</label>
        <AuthInput
          name="phone"
          placeholder="00000 00000"
          value={form.phone}
          onChange={handleChange}
          icon={<FaPhoneAlt />}
        />
        {errors.phone && <p className={styles.error}>{errors.phone}</p>}

        {/* Password */}
        <label>Password</label>
        <div className={styles.passwordWrapper}>
          <AuthInput
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            icon={<FaLock />}
          />
          <span
            className={styles.eye}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        {errors.password && <p className={styles.error}>{errors.password}</p>}

        {/* Confirm Password */}
        <label>Confirm Password</label>
        <AuthInput
          type="password"
          name="confirmPassword"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={handleChange}
          icon={<FaLock />}
        />
        {errors.confirmPassword && (
          <p className={styles.error}>{errors.confirmPassword}</p>
        )}

        {errors.general && <p className={styles.error}>{errors.general}</p>}

        <button className={styles.button} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>
      </form>

      <p className={styles.footer}>
        Already have an account?{" "}
        <span onClick={() => navigate("/login")}>Sign in</span>
      </p>

      <p className={styles.back} onClick={() => navigate("/")}>
        ← Back to Home
      </p>
    </AuthCard>
  );
};

export default Signup;