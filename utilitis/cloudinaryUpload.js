import fs from "fs";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

 const uploadToCloudinary = () => {
  return async (req, res, next) => {
    if (!req.file || !req.file.path) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "uploads",
      });

      req.cloudinaryUrl = result.secure_url;

      // Optional: remove local file after upload
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Failed to delete local file:", err);
      });

      next();
    } catch (err) {
      res.status(500).json({
        error: "Cloudinary upload failed",
        details: err.message,
      });
    }
  };
};

export default uploadToCloudinary
