import Reply from "../models/Reply.js";
import Post from "../models/Post.js";
import Like from "../models/Like.js";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import Repost from "../models/Repost.js";

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .rotate()
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
     .toBuffer();
};

export const getReplies = async (req, res) => {
  try {
    const { page } = req.query;

    const { commentId } = req.params;

    const replies = await Reply.find({ comment: commentId })
      .populate("user", "firstName lastName verified picturePath _id")
      .limit(6)
      .skip(6 * (page - 1));

    const repliesWithIsLiked = await Promise.all(
      replies.map(async (reply) => {
        const isLiked = await Like.findOne({
          userId: req.user.id,
          replyId: reply._id.toString(),
        });

        return {
          ...reply._doc,
          isLiked: Boolean(isLiked),
        };
      })
    );

    res.status(200).json(repliesWithIsLiked);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const postReply = async (req, res) => {
  let picturePath = null;

  if (req.file) {
    try {
      const uniqueImageName = `${uuidv4()}-${req.file.originalname}`;
      const compressedBuffer = await compressImage(req.file.buffer);
      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "image",
            public_id: uniqueImageName,
            folder: "posts",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(compressedBuffer);
      });
      picturePath = result.secure_url;
    } catch (error) {
      res.status(500).json({ message: error });
    }
  }

  try {
    const { commentId } = req.params;
    const { reply } = req.body;

    const newReply = new Reply({
      user: req.user.id,
      comment: commentId,
      reply: reply || "",
      picturePath: picturePath || "",
    });

    await newReply.save();

    const replyWithUserInfo = await newReply.populate(
      "user",
      "firstName lastName verified picturePath _id"
    );

    const post = await Post.findById(req.body.postId).populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    if (post) {
      await Post.findByIdAndUpdate(req.body.postId, {
        $inc: {
          commentCount: 1,
        },
      });
    } else {
      await Repost.findByIdAndUpdate(req.body.postId, {
        $inc: {
          commentCount: 1,
        },
      });
    }

    return res.status(200).json(replyWithUserInfo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId).populate(
      "comment",
      "postId repostId"
    );

    if (req.user.id !== reply.user.toString()) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    await Reply.findByIdAndDelete(replyId);

    const post = await Post.findById(reply.comment.postId).populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    if (post) {
      await Post.findByIdAndUpdate(reply.comment.postId, {
        $inc: {
          commentCount: -1,
        },
      });
    } else {
      await Repost.findByIdAndUpdate(reply.comment.repostId, {
        $inc: {
          commentCount: -1,
        },
      });
    }

    return res.status(200).json({ message: "Reply deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editReply = async (req, res) => {
  try {
    const { replyId } = req.params;

    const reply = await Reply.findById(replyId);

    if (!reply) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (req.user.id !== reply.user.toString()) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    reply.reply = req.body.reply;
    reply.edited = true;

    await reply.save();

    return res
      .status(200)
      .json({ comment: reply.comment, reply: req.body.reply });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
