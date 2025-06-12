import express from "express";
import {
  deleteQuery,
  deleteUser,
  forgotPassword,
  getAllQueries,
  getAllUsers,
  getMyQueries,
  getUserProfile,
  login,
  logout,
  register,
  replyToQuery,
  resetPassword,
  sendQuery,
  updateProfile,
} from "../controllers/user.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import upload from "../utils/multer.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword").post(resetPassword);
router.route("/profile").get(isAuthenticated, getUserProfile);
router.route("/queries").post(isAuthenticated, sendQuery);
router
  .route("/getAllQueries")
  .get(isAuthenticated, checkRole(["admin"]), getAllQueries);

router.route("/getMyQuery").get(isAuthenticated, getMyQueries);
router
  .route("/deleteQueries/:queryId")
  .delete(isAuthenticated, checkRole(["admin"]), deleteQuery);

router.put(
  "/queryReply/:queryId",
  isAuthenticated,
  checkRole(["admin"]),
  replyToQuery
);
router
  .route("/profile/update")
  .put(isAuthenticated, upload.single("profilePhoto"), updateProfile);

router
  .route("/getAllUsers")
  .get(isAuthenticated, checkRole(["admin"]), getAllUsers);

router
  .route("/deleteUser/:id")
  .delete(isAuthenticated, checkRole(["admin"]), deleteUser);

export default router;
