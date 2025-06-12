// models/query.model.js
import mongoose from "mongoose";

const querySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reply: {
      message: { type: String },
      repliedAt: { type: Date },
      repliedBy: { type: String }, // admin who replied
    },
  },
  { timestamps: true }
);

const Query = mongoose.model("Query", querySchema);
export default Query;
