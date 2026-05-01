import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import sendMail from "../utils/sendMail.js";

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
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return user;
};

export const verifyAccountOtpSend = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const user = await User.findOne({email});
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();
  const html =`
    <div style="font-family: sans-serif;">
      <h2>Verify your account</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    </div>
  `;

  await sendMail(email, "Account Verification", html);
}

export const verifyOtpAndVerifyAccount = async (email, otp) => {
  const user = await User.findOne({ email });

  if (!user) throw new Error("User not found");

  if (user.isVerified) return;

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpiry < Date.now()) {
    throw new Error("OTP expired");
  }

  user.isVerified = true;
  user.otp = null;
  user.otpExpiry = null;

  await user.save();
};

export const forgotPasswordService = async (email) => {
  const user = await User.findOne({email});
  if(!user) throw new Error("User not found");
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  user.otp = otp;
  user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();
  const html =`
    <div style="font-family: sans-serif;">
      <h2>Reset password</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP will expire in 10 minutes.</p>
    </div>
  `;
  await sendMail(email, "Reset Password", html);
}

export const resetPasswordService = async (email, otp, newPassword) => {
  const user = await User.findOne({email});
  if(!user) throw new Error("User not found");

  if (user.otp !== otp) {
    throw new Error("Invalid OTP");
  }

  if (user.otpExpiry < Date.now()) {
    throw new Error("OTP expired");
  }
  
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.otp=null;
  user.otpExpiry=null;
  await user.save()
}