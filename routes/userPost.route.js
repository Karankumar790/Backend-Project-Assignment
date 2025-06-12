import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import {
  createPost,
  deletePost,
  getAllUserPosts,
  getUserPosts,
  updatePost,
} from "../controllers/userPost.controller.js";
import { checkRole } from "../middlewares/checkRole.js";
import upload from "../utils/multer.js";

const postRouter = express.Router();

postRouter
  .route("/post")
  .post(isAuthenticated, upload.single("media"), createPost)
  .get(isAuthenticated, getUserPosts);

postRouter
  .route("/post/:id")
  .put(isAuthenticated, upload.single("media"), updatePost)
  .delete(isAuthenticated, deletePost);

postRouter.route("/getAllUserPost").get(getAllUserPosts);

export default postRouter;
