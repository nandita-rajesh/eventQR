import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Signup.module.css";
import { registerUser } from "../../../shared/api/authApi";
import { useNavigate } from "react-router-dom";

import { FaQrcode, FaUser, FaEnvelope, FaPhoneAlt, FaLock } from "react-icons/fa";

const Signup = () => {
    const [role, setRole] = useState("organizer");

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const payload = {
                name: form.name,
                email: form.email,
                password: form.password,
                phoneNumber: form.phone,
                role: role,
            };

            console.log("Payload:", payload);

            const res = await registerUser(payload);

            console.log("Signup success:", res);

            navigate("/verify-otp", {
            state: { email: form.email }
            });

        } catch (err) {
            console.error("Signup error:", err.response?.data);
            alert(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <AuthCard>

            {/* Logo */}
            <div className={styles.logoRow}>
                <FaQrcode className={styles.logoIcon} />
                <h1>EventQR</h1>
            </div>

            <h2 className={styles.title}>Create Account</h2>
            <p className={styles.subtitle}>
                Start managing events with ease
            </p>

            <p className={styles.labelTop}>Register as</p>

            {/* Role Toggle */}
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

                <label>Full Name</label>
                <AuthInput
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    icon={<FaUser />}
                />

                <label>Email Address</label>
                <AuthInput
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    icon={<FaEnvelope />}
                />

                <label>Phone Number</label>
                <AuthInput
                    type="text"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={handleChange}
                    icon={<FaPhoneAlt />}
                />

                <label>Password</label>
                <AuthInput
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    icon={<FaLock />}
                />

                <label>Confirm Password</label>
                <AuthInput
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    icon={<FaLock />}
                />

                <button className={styles.button}>
                Create Account
                </button>
            </form>

            <p className={styles.footer}>
                Already have an account? <span>Sign in</span>
            </p>

            <p className={styles.back}>← Back to Home</p>
        </AuthCard>
    );
};

export default Signup;