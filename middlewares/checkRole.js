// middleware/checkRole.js
import { User } from "../models/user.model.js"; // Adjust path based on your project

export const checkRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const userId = req.id;

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const userRole = user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden. Access denied.",
        });
      }

      req.user = user; // Optional: attach full user to request
      next();
    } catch (error) {
      console.error("Role check error:", error);
      return res.status(500).json({
        success: false,
        message: "Something went wrong in role check.",
        error: error.message,
      });
    }
  };
};
