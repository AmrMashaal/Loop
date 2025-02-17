import sharp from "sharp";
import Message from "../models/Message.js";
import CryptoJS from "crypto-js";
import { v4 } from "uuid";
import path from "path";

export const getMessages = async (req, res) => {
  const { page, limit = 15 } = req.query;
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId: senderId, receiverId: receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("senderId receiverId", "picturePath _id");

    if (!messages) {
      return res.status(404).json({ message: "There is no message" });
    }

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
    .toBuffer();
};

export const sendMessage = async (req, res) => {
  const { senderId, receiverId } = req.params;

  function encryptMessage(message) {
    return CryptoJS.AES.encrypt(message, process.env.MESSAGE_SECRET);
  }

  let picturePath = null;

  if (req.file) {
    try {
      const uniqueImageName = `${v4()}-${req.file.originalname}`;
      const compressedBuffer = await compressImage(req.file.buffer);
      const filePath = path.join(
        process.cwd(),
        "public/assets",
        uniqueImageName
      );

      // Save the compressed image to the file system
      await sharp(compressedBuffer).toFile(filePath);
      req.file.path = filePath; // Update file path for potential future use
      picturePath = encryptMessage(uniqueImageName).toString();
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  try {
    const message = new Message({
      receiverId: receiverId,
      senderId: senderId,
      text: req.body.text,
      picturePath,
    });

    const data = await message.save();

    await data.populate("senderId receiverId", "picturePath _id");

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
