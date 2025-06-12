import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
    expires: 600, // ⏳ Automatically deletes the document after 10 minutes (600 seconds)
  },
});

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
