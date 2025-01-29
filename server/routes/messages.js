import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { getMessages, sendMessage } from "../controllers/message.js";
import { upload } from "../config/multer.js";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compressImage = async (buffer) => {
  return sharp(buffer)
    .resize(1000) // Resize the image
    .jpeg({ quality: 70 }) // Compress the image
    .toBuffer(); // Return the processed image as a buffer
};

const uploadAndCompress = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const compressedBuffer = await compressImage(req.file.buffer);
    const dirPath = path.join(__dirname, "public/assets");
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    const filePath = path.join(dirPath, req.file.originalname);
    await sharp(compressedBuffer).toFile(filePath);

    req.file.path = filePath; // Update the file path
    next(); // Proceed to the next step
  } catch (err) {
    console.error("Image compression error:", err);
    res.status(500).json({ message: "Image compression failed" });
  }
};


router.get("/:senderId/:receiverId", verifyToken, getMessages);

router.post(
  "/:senderId/:receiverId",
  verifyToken,
  upload.single("picture"),
  uploadAndCompress,
  sendMessage
);

export default router;
