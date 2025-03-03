import sharp from "sharp";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Friend from "../models/Friend.js";
import Notification from "../models/notification.js";
import cloudinary from "../utils/cloudinary.js";

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
    .toBuffer();
};

export const createPost = async (req, res) => {
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
      res.status(500).json({ message: error.message });
    }
  }

  try {
    // Destructure and set post details
    const { userId, description, textAddition, privacy } = req.body;
    const user = await User.findById(userId);

    const newPost = new Post({
      userId,
      description,
      picturePath,
      firstName: user.firstName,
      lastName: user.lastName,
      userPicturePath: user.picturePath,
      location: user.location,
      verified: user.verified,
      textAddition: textAddition,
      privacy,
      comments: [],
      likes: [],
    });

    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Image compression or post creation error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getFeedPosts = async (req, res) => {
  const { page, limit = 5 } = req.query;
  const { id } = req.user;

  try {
    const friendsPromise = await Friend.find({
      $or: [
        { sender: id, status: "accepted" },
        { receiver: id, status: "accepted" },
      ],
    });

    const friendsIds = friendsPromise.map((fr) => {
      return fr.sender.toString() === id
        ? fr.receiver.toString()
        : fr.sender.toString();
    });

    let posts = await Post.find({
      $or: [
        { privacy: "friends", userId: { $in: friendsIds } },
        { privacy: "public" },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const postsWithIsLiked = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await Like.findOne({
          userId: req.user.id,
          postId: post._id,
        });

        return { ...post._doc, isLiked: Boolean(isLiked) };
      })
    );

    res.status(200).json(postsWithIsLiked);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  const { page, limit = 5 } = req.query;
  const { userId } = req.params;

  try {
    const userFriends = await Friend.find({
      $or: [
        { sender: userId, status: "accepted" },
        { receiver: userId, status: "accepted" },
      ],
    });

    const isFriend = userFriends.some((friend) => {
      return (
        friend.sender.toString() === req.user.id ||
        friend.receiver.toString() === req.user.id
      );
    });

    let userPosts;
    if (userId === req.user.id) {
      userPosts = await Post.find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ pinned: -1, createdAt: -1 });
    } else if (isFriend) {
      userPosts = await Post.find({
        userId,
        $or: [{ privacy: "public" }, { privacy: "friends" }],
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ pinned: -1, createdAt: -1 });
    } else if (!isFriend) {
      userPosts = await Post.find({ userId, privacy: "public" })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ pinned: -1, createdAt: -1 });
    }

    const postsWithIsLiked = await Promise.all(
      userPosts.map(async (post) => {
        const isLiked = await Like.findOne({
          userId: req.user.id,
          postId: post._id,
        });

        return { ...post._doc, isLiked: Boolean(isLiked) };
      })
    );

    const postsCount = await Post.countDocuments({ userId });

    res.status(200).json({ posts: postsWithIsLiked, count: postsCount });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (post.userId.toString() !== req.user.id && post.privacy === "private") {
      res.status(403).json({ message: "Forbidden!" });
    } else {
      if (!post) {
        return res.status(404).json({ message: "Post is not found" });
      }

      const isLiked = await Like.findOne({
        userId: req.user.id,
        postId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    await Notification.deleteMany({ linkId: id });

    await Comment.deleteMany({ postId: id });

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({ message: "Post is not found" });
    }

    res.status(200).json(deletedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);
    if (req.user.id === post.userId.toString()) {
      if (!post) {
        return res.status(404).json({ message: "Post is not found" });
      }

      post.description = req.body.description;
      post.edited = true;

      const result = await post.save();

      const isLiked = await Like.findOne({
        userId: req.user.id,
        postId: post._id,
      });

      const postWithIsLiked = { ...result._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    } else {
      res.status(403).json({ message: "Forbidden!" });
    }
  } catch (error) {
    res.status(500).json({ message: err.message });
  }
};

export const pinPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (req.user.id === post.userId.toString()) {
      if (!post) {
        return res.status(404).json({ message: "Post is not found" });
      }

      if (post.pinned) {
        post.pinned = false;
      } else {
        post.pinned = true;
      }

      await post.save();

      const isLiked = await Like.findOne({
        userId: req.user.id,
        postId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    } else {
      res.status(403).json({ message: "Forbidden!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostClickInfo = async (req, res) => {
  const { postId } = req.params;
  let isLiked;

  try {
    const { likesCount, commentCount } = await Post.findById(postId).select(
      "likesCount commentCount"
    );

    const checkLike = await Like.findOne({
      userId: req.user.id,
      postId: postId,
    });

    if (checkLike) {
      isLiked = true;
    } else {
      isLiked = false;
    }

    res.status(200).json({ likesCount, commentsCount: commentCount, isLiked });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePrivacy = async (req, res) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (req.user.id === post.userId.toString()) {
      if (!post) {
        return res.status(404).json({ message: "Post is not found" });
      }

      post.privacy = req.body.privacy;

      await post.save();

      const isLiked = await Like.findOne({
        userId: req.user.id,
        postId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    } else {
      res.status(403).json({ message: "Forbidden!" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
