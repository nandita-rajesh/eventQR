import React, { useState } from "react";
import AuthCard from "../components/AuthCard";
import AuthInput from "../components/AuthInput";
import styles from "./Login.module.css";
import { FaQrcode } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../../shared/api/authApi";

import { FaEnvelope, FaLock } from "react-icons/fa";

const Login = () => {
    const [form, setForm] = useState({
        email: "",
        password: "",
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

        try {
            const res = await loginUser({
            email: form.email,
            password: form.password,
            });

            console.log("Login success:", res);

            // STORE TOKEN
            localStorage.setItem("user", JSON.stringify(res.user));

            if (res.user.role === "organizer") {
                navigate("/dashboard");
            } else {
                navigate("/dashboard/volunteer");
            }

        } catch (err) {
            console.error("Login failed:", err.response?.data || err.message);
            alert("Invalid credentials");
        }
    };

    return (
        <AuthCard>

            {/* Logo */}
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

                {/* Remember + Forgot */}
                <div className={styles.row}>
                    <label className={styles.checkbox}>
                        <input type="checkbox" /> Remember me
                    </label>
                    <span className={styles.link}>Forgot password?</span>
                </div>

                <button className={styles.button}>
                    Sign In
                </button>
            </form>

            <p className={styles.footer}>
                Don’t have an account? <span>Sign up</span>
            </p>

            <p className={styles.back}>← Back to Home</p>
        </AuthCard>
    );
};

export default Login;