import axios from "axios";

const API = "http://localhost:5000/api/auth";

// LOGIN 
export const loginUser = async (data) => {
  const res = await axios.post(`${API}/login`, data);
  return res.data;
};

// REGISTER
export const registerUser = async (data) => {
  const res = await axios.post(`${API}/register`, data);
  return res.data;
};

// VERIFY OTP
export const verifyOtp = async (data) => {
  const res = await axios.post(
    "http://localhost:5000/api/auth/verify-otp",
    data
  );
  return res.data;
};

// GET CURRENT USER
export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");

  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};