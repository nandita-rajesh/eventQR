import { registerUser, loginUser, verifyAccountOtpSend, verifyOtpAndVerifyAccount, forgotPasswordService, resetPasswordService, resendOtpService} from "../services/auth.service.js";
import generateToken from "../utils/generateToken.js";
import User from "../models/user.model.js";

export const register = async (req, res) => {
  try {
    const { name, email, phoneNumber, password , role} = req.body;

    if (!name || !email || !password || !phoneNumber || !role) {
      return res.status(400).json({ error: "All fields required" });
    }

    const user = await registerUser(name, email, phoneNumber, password, role);
    await verifyAccountOtpSend(email);
    return res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }
    
    const user = await loginUser(email, password);

    return res.json({
      user: {
         _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token: generateToken(user),
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
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

export const resendOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({ error: "Email and type required" });
    }

    await resendOtpService(email, type);

    return res.status(200).json({
      message: "OTP resent successfully",
    });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const {email} = req.body;

    if(!email){
      return res.status(400).json({error: "Email required." })
    }
    
    await forgotPasswordService(email);

    return res.status(200).json({message: "OTP Sent to mail"});
  } catch (err){
    return res.status(400).json({ error: err.message });
  }
}

export const resetPassword = async (req, res) => {
  try {
    const {email, otp, newPassword} = req.body;

    if(!email || !otp || !newPassword){
      return res.status(400).json({error: "All fields are required"});
    }

    await resetPasswordService(email, otp, newPassword);

    return res.status(200).json({message:"Password reset successfully"})
  } catch (err){
    return res.status(400).json({ error: err.message });
  }
}

export const getMe = async(req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}