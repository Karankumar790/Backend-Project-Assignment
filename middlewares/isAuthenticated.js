import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        message: "User not authenticated. Token missing.",
        success: false,
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // ✅ Debug: Log decoded token

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        message: "Invalid token payload. User ID missing.",
        success: false,
      });
    }

    // Attach userId to request object
    req.id = decoded.userId;

    next(); // Continue to next middleware or route
  } catch (error) {
    console.error("JWT Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired. Please log in again.",
        success: false,
      });
    }

    return res.status(401).json({
      message: "Invalid or expired token.",
      success: false,
    });
  }
};



export default isAuthenticated;
