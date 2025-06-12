import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
// Load environment variables
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Upload any media file (image, video, etc.)
export const uploadMedia = async (file) => {
  try {
    const uploadResponse = await cloudinary.uploader.upload(file, {
      resource_type: "auto", // auto-detects type: image/video
    });
    return uploadResponse;
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
};

export const uploadOnCloudinary = async (localFilePath, folderName) => {
  try {
    if (!localFilePath || !fs.existsSync(localFilePath)) {
      return null;
    }
    // Upload the file on Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: `Task_Project_data/${folderName}`,
    });
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    console.error("Upload error:", error);
    return null;
  }
};

// Delete image or other non-video media
export const deleteMediaFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Delete Media Error:", error);
    throw error;
  }
};

// Delete video specifically
export const deleteVideoFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
    return result;
  } catch (error) {
    console.error("Delete Video Error:", error);
    throw error;
  }
};
