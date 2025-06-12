import UserPost from "../models/userPost.model.js";
import { uploadMedia, uploadOnCloudinary } from "../utils/cloudinary.js";

export const createPost = async (req, res) => {
  try {
    const { postName, caption } = req.body;
    const filePath = req.file?.path;

    if (!postName || !caption || !filePath) {
      return res.status(400).json({
        success: false,
        message: "Post name, caption, and media file are required.",
      });
    }

    const cloudinaryResult = await uploadOnCloudinary(filePath, "userPost");

    const newPost = await UserPost.create({
      postName,
      caption,
      postImageOrVedio: cloudinaryResult.secure_url,
      user: req.id,
    });

    return res.status(201).json({
      success: true,
      message: "Post created successfully.",
      data: newPost,
    });
  } catch (error) {
    console.error("Create Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create post.",
      error: error.message,
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { postName, caption } = req.body;
    const postId = req.params.id;
    const filePath = req.file.path;
    const post = await UserPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // If a new file is uploaded, re-upload to cloudinary
    let mediaUrl = post.postImageOrVedio;
    if (req.file?.path) {
      const uploadResult = await uploadOnCloudinary(filePath, "userPost");
      mediaUrl = uploadResult.secure_url;
    }

    post.postName = postName || post.postName;
    post.caption = caption || post.caption;
    post.postImageOrVedio = mediaUrl;

    await post.save();

    return res.status(200).json({
      success: true,
      message: "Post updated successfully.",
      data: post,
    });
  } catch (error) {
    console.error("Update Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update post.",
      error: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;

    const deletedPost = await UserPost.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: "Post not found.",
      });
    }

    // Optional: remove file from Cloudinary if you store public_id

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully.",
      data: deletedPost,
    });
  } catch (error) {
    console.error("Delete Post Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete post.",
      error: error.message,
    });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const userId = req.id; // from isAuthenticated

    const posts = await UserPost.find({ user: userId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "User's posts fetched successfully.",
      data: posts,
    });
  } catch (error) {
    console.error("Get User Posts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user's posts.",
      error: error.message,
    });
  }
};

export const getAllUserPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await UserPost.countDocuments();

    const posts = await UserPost.find()
      .populate("user", "name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "All users posts fetched successfully.",
      data: posts,
      pagination: {
        totalPosts,
        totalPages: Math.ceil(totalPosts / limit),
        currentPage: page,
        pageSize: limit,
      },
    });
  } catch (error) {
    console.error("Pagination Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch All users posts.",
      error: error.message,
    });
  }
};
