import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import sendMail from "../utils/sendMail.js";
import Otp from "../models/otp.model.js";

export const registerUser = async (name, email, phoneNumber, password, role) => {
  const existing = await User.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    phoneNumber,
    password: hashedPassword,
    role
  });

  return user;
};

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Account does not exist");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  if (!user.isVerified) {
    throw new Error("Please verify your account first");
  }

  return user;
};

export const verifyAccountOtpSend = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  if (user.isVerified) throw new Error("Already verified");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email, type: "verify" });

  await Otp.create({
    email,
    otp,
    type: "verify",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const html = `
    <div style="font-family: sans-serif;">
      <h2>Verify your account</h2>
      <h1>${otp}</h1>
    </div>
  `;

  await sendMail(email, "Account Verification", html);
};

export const verifyOtpAndVerifyAccount = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const record = await Otp.findOne({ email, type: "verify" });
  if (!record) throw new Error("OTP not found");

  if (record.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  if (record.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  user.isVerified = true;
  await user.save();

  await Otp.deleteMany({ email, type: "verify" });
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email, type: "reset" });

  await Otp.create({
    email,
    otp,
    type: "reset",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  const html = `
    <div style="font-family: sans-serif;">
      <h2>Reset password</h2>
      <h1>${otp}</h1>
    </div>
  `;

  await sendMail(email, "Reset Password", html);
};

export const resetPasswordService = async (email, otp, newPassword) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const record = await Otp.findOne({ email, type: "reset" });
  if (!record) throw new Error("OTP not found");

  if (record.expiresAt < new Date()) {
    throw new Error("OTP expired");
  }

  if (record.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  await Otp.deleteMany({ email, type: "reset" });
};

export const resendOtpService = async (email, type) => {
  if (!["verify", "reset"].includes(type)) {
    throw new Error("Invalid type");
  }

  if (type === "verify") {
    return verifyAccountOtpSend(email);
  }

  if (type === "reset") {
    return forgotPasswordService(email);
  }
};