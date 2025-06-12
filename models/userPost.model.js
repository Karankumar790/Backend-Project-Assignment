import mongoose from "mongoose";

const userPostSchema = new mongoose.Schema(
  {
    postName: { type: String, required: true },
    postImageOrVedio: { type: String },
    caption: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const UserPost = mongoose.model("UserPost", userPostSchema);

export default UserPost;
