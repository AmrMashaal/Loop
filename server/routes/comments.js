import express from "express";
import {
  getComments,
  deleteComment,
  editComment,
  pinComment,
  postCommentOriginal,
} from "../controllers/comment.js";
import { verifyToken } from "../middleware/auth.js";
import { upload } from "../config/multer.js";
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

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

router.get("/:postId/:commentId", verifyToken, getComments);

router.post(
  "/postComment/:postId",
  verifyToken,
  upload.single("picture"),
  uploadAndCompress,
  postCommentOriginal
);

router.patch("/:commentId/edit", verifyToken, editComment);
router.patch("/:commentId/pin", verifyToken, pinComment);

router.delete("/:commentId", verifyToken, deleteComment);

export default router;
