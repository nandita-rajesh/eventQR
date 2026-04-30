import { registerUser, loginUser, verifyAccountOtpSend, verifyOtpAndVerifyAccount, forgotPasswordService, resetPasswordService} from "../services/auth.service.js";
import generateToken from "../utils/generateToken.js";
import User from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password } = req.body;

    if (!name || !email || !password || !phoneNumber) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await registerUser(name, email, phoneNumber, password);
    await verifyAccountOtpSend(email);
    res.status(201).json({
      user
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await loginUser(email, password);

    res.json({
      user,
      token: generateToken(user),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "All fields required" });
    }

    await verifyOtpAndVerifyAccount(email, otp);

    return res.json({ message: "Account verified successfully" });

  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;

    if(!email){
      res.status(400).json({error: "Email required." })
    }
    
    await forgotPasswordService(email);

    res.status(200).json({message: "OTP Sent to mail"});
  } catch (err){
    return res.status(400).json({ error: err.message });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
      res.status(400).json({error: "All fields are required"});
    }

    await resetPasswordService(email, otp, newPassword);

    res.status(200).json({message:"Password reset successfully"})
  } catch (err){
    return res.status(400).json({ error: err.message });
  }
}

export const getMe = async(req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpiry -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}