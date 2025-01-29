import express from "express";
import { login, register } from "../controllers/auth.js";
import { upload } from "../config/multer.js";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";
import fs from "fs";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compressImage = async (buffer) => {
  return sharp(buffer).resize(1000).jpeg({ quality: 70 }).toBuffer();
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

    req.file.path = filePath;
    next();
  } catch (err) {
    console.error("Image compression error:", err);
    res.status(500).json({ message: "Image compression failed" });
  }
};

router.post("/register", upload.single("picture"), uploadAndCompress, register);
router.post("/login", login);

export default router;
