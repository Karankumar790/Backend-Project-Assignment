import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import connectDB from "./database/db.js";
import userRoute from "./routes/user.route.js";
import courseRoute from "./routes/course.route.js";
import mediaRoute from "./routes/media.route.js";
import purchaseRoute from "./routes/purchaseCourse.route.js";
import courseProgressRoute from "./routes/courseProgress.route.js";
import postRouter from "./routes/userPost.route.js";

dotenv.config(); // No need to pass an empty object

// Connect to DB
connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://project-assignment-frontend-nxuz.vercel.app/"
    ],
    credentials: true,
  })
);

// API Routes
app.use("/api/v1/media", mediaRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/purchase", purchaseRoute);
app.use("/api/v1/progress", courseProgressRoute);
app.use("/api/v1/userPost", postRouter);

// Health check route
app.get("/", (req, res) => {
  res.send("API is Running... Have a good day!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
