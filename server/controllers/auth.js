import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import sharp from "sharp";
import { v4 } from "uuid";
import path from "path";

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
    .toBuffer();
};

export const register = async (req, res) => {
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
      picturePath = uniqueImageName;
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  try {
    const {
      firstName,
      lastName,
      username,
      password,
      friends,
      occupation,
      location,
      birthdate,
      gender,
    } = req.body;

    const isUsernameExisted = await User.findOne({ username });

    if (isUsernameExisted) {
      return res
        .status(400)
        .json({ message: "This Username Is Already Existed" });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = new User({
      firstName,
      lastName,
      username,
      password: passwordHash,
      picturePath,
      friends,
      occupation,
      location,
      birthdate,
      gender,
    });

    const savedUser = await user.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;
  
  try {
    const user = await User.findOne({ username });

    const realPassword = await bcrypt.compare(password, user.password);

    if (!user) {
      return res.status(404).json({ message: "User does not exist." });
    }

    if (!realPassword && user) {
      return res.status(400).json({ message: "Wrong password." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    delete user.password;

    return res.status(200).json({ token, user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
