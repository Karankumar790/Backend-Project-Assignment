import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { deleteMediaFromCloudinary, uploadMedia } from "../utils/cloudinary.js";
import Otp from "../models/otp.model.js";
import { sendMail, sendOtpEmail } from "../utils/send-otp-mail.js";
import crypto from "crypto";
import Query from "../models/query.model.js";

const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6-digit OTP
};
// ✅ Register User
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email!",
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password,
    });

    return res.status(201).json({
      success: true,
      message: "Account created successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to register!",
    });
  }
};

// ✅ Login User
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required!",
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password!",
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect email or password!",
      });
    }

    generateToken(res, user, `Welcome back ${user.name}`);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to login!",
    });
  }
};

// ✅ Logout User
export const logout = async (_, res) => {
  try {
    return res
      .clearCookie("jwt", {
        httpOnly: true,
        sameSite: "None", // Same as token generation
        secure: true, // Must match
      })
      .status(200)
      .json({
        success: true,
        message: "Logged out successfully.",
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to logout.",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // ✅ Generate OTP
    const otp = generateOTP(); // Generate 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // Expires in 10 minutes

    // ✅ Save OTP in the database (overwrite if existing)
    try {
      await Otp.findOneAndUpdate(
        { email },
        { email, otp, otpExpires },
        { upsert: true, new: true }
      );
    } catch (error) {
      return res.send("otp not found!");
    }

    // ✅ Send OTP to the user's email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your email. Use it to reset your password.",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;
    if (!email || !otp || !newPassword || !confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }
    const otpData = await Otp.findOne({ email });
    if (!otpData) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or expired" });
    }
    if (otpData.otpExpires < Date.now()) {
      await Otp.deleteOne({ email }); // Delete expired OTP
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new one.",
      });
    }
    if (otpData.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    user.password = newPassword;
    await user.save();
    await Otp.deleteOne({ email });
    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully!" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error", error });
  }
};

// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.id;

    const user = await User.findById(userId)
      .select("-password")
      .populate("enrolledCourses");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to load user.",
    });
  }
};

// ✅ Update User Profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { name } = req.body;
    const profilePhoto = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found!",
      });
    }

    // Delete old image if exists
    if (user.photoUrl) {
      const publicId = user.photoUrl.split("/").pop().split(".")[0];
      await deleteMediaFromCloudinary(publicId); // Ensure you await it
    }

    // Upload new photo
    let photoUrl = user.photoUrl;
    if (profilePhoto) {
      const cloudResponse = await uploadMedia(profilePhoto.path);
      photoUrl = cloudResponse.secure_url;
    }

    const updatedData = { name };
    if (photoUrl) updatedData.photoUrl = photoUrl;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
      new: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully!",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile!",
    });
  }
};

export const sendQuery = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    const userId = req.id;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const newQuery = await Query.create({
      name,
      email,
      message,
      user: userId || null,
    });

    return res.status(201).json({
      success: true,
      message: "Query sent successfully.",
      // data: newQuery,
    });
  } catch (error) {
    console.error("Error sending query:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending the query.",
      error: error.message,
    });
  }
};

// 2. Get all queries (admin access)
export const getAllQueries = async (req, res) => {
  try {
    const queries = await Query.find().populate("user", "name email");

    return res.status(200).json({
      success: true,
      message: "All queries fetched successfully.",
      data: queries,
    });
  } catch (error) {
    console.error("Error fetching queries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch queries.",
      error: error.message,
    });
  }
};

export const deleteQuery = async (req, res) => {
  try {
    const queryId = req.params?.queryId;

    const deletedQuery = await Query.findByIdAndDelete({ _id: queryId });

    if (!deletedQuery) {
      return res.status(404).json({
        success: false,
        message: "Query not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Query deleted successfully.",
      data: deletedQuery,
    });
  } catch (error) {
    console.error("Error deleting query:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while deleting the query.",
      error: error.message,
    });
  }
};

export const getMyQueries = async (req, res) => {
  try {
    const userId = req.id;

    const queries = await Query.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User queries fetched successfully.",
      data: queries,
    });
  } catch (error) {
    console.error("Error fetching user queries:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch queries.",
      error: error.message,
    });
  }
};

export const replyToQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { replyMessage } = req.body;
    const adminName = req.user?.name;

    const query = await Query.findById(queryId);
    if (!query) {
      return res
        .status(404)
        .json({ success: false, message: "Query not found." });
    }

    // Update the query with the reply
    query.reply = {
      message: replyMessage,
      repliedAt: new Date(),
      repliedBy: adminName,
    };

    await query.save();

    // Optional: Send email to user
    await sendMail(query.email, replyMessage);

    return res.status(200).json({
      success: true,
      message: "Reply sent and saved successfully.",
      data: query,
    });
  } catch (error) {
    console.error("Reply Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reply to query.",
      error: error.message,
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    // Get page and limit from query, defaulting to 1 and 10
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    // Total user count for pagination metadata
    const totalUsers = await User.countDocuments();

    // Get paginated users
    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // optional: newest first

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully.",
      data: users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
      data: deletedUser,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user.",
      error: error.message,
    });
  }
};

