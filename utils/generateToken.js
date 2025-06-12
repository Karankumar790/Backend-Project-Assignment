import jwt from "jsonwebtoken";

export const generateToken = (res, user, message) => {
  const token = jwt.sign(
    { userId: user._id },
    process.env.SECRET_KEY,
    { expiresIn: "1d" }
  );

  res.cookie("jwt", token, {
   httpOnly: true,
  sameSite: "None", // ✅ Required for cross-site cookies
  secure: true,     // ✅ Required for cross-site cookies in production
  maxAge: 24 * 60 * 60 * 1000, // 1 day
});

  return res.status(200).json({
    success: true,
    message,
    user,
  });
};
