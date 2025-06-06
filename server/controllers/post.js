import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Friend from "../models/Friend.js";
import cloudinary from "../utils/cloudinary.js";
import Repost from "../models/Repost.js";
import Badge from "../models/Badge.js";
import Notification from "../models/notification.js";
import Follow from "../models/Follow.js";
import mongoose from "mongoose";

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .rotate()
    .resize({ width: 800 })
    .jpeg({ quality: 80 })
     .toBuffer();
};

export const createPost = async (req, res) => {
  let imagesUrl = [];
  if (req.files && req.files.length > 0 && req.files.length <= 4) {
    for (const file of req.files) {
      const uniqueImageName = `${uuidv4()}-${file.originalname}`;

      const compressedBuffer = await compressImage(file.buffer);

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

      imagesUrl.push(result.secure_url);
    }
  }

  try {
    const { userId, description, privacy } = req.body;

    if (userId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    const newPost = new Post({
      userId,
      description,
      picturePath: imagesUrl,
      privacy,
    });

    await newPost.save();

    await newPost.populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    const postsCount = await Post.countDocuments({
      userId,
      $or: [{ privacy: "public" }, { privacy: "friends" }],
    });

    const isBadge = await Badge.findOne({ type: "post", userId });

    if (postsCount === 1 || !isBadge) {
      const badge = new Badge({
        name: "Keyboard Rookie",
        description: "User has created his first post",
        icon: "📝",
        userId,
        level: "bronze",
        type: "post",
        criteria: "User must share his first post",
      });

      await badge.save();

      const notification = new Notification({
        receiverId: userId,
        type: "badge",
        linkId: `/profile/${userId}`,
        description: "You have earned a new badge - Keyboard Rookie",
      });

      await notification.save();
    } else if (postsCount === 10) {
      await Badge.findOneAndUpdate(
        { type: "post", userId },
        {
          name: "Chatterbox",
          description: "User has created 10 posts",
          level: "silver",
          criteria: "User must share 10 posts",
          userId,
          type: "post",
          icon: "📢",
        },
        { upsert: true }
      );

      const notification = new Notification({
        receiverId: userId,
        type: "badge",
        linkId: `/profile/${userId}`,
        description: "You have earned a new badge - Chatterbox",
      });

      await notification.save();
    } else if (postsCount === 50) {
      await Badge.findOneAndUpdate(
        { type: "post", userId },
        {
          name: "Serial Poster",
          description: "User has created 50 posts",
          level: "gold",
          criteria: "User must share 50 posts",
          userId,
          type: "post",
          icon: "📌",
        },
        { upsert: true }
      );

      const notification = new Notification({
        receiverId: userId,
        type: "badge",
        linkId: `/profile/${userId}`,
        description: "You have earned a new badge - Serial Poster",
      });

      await notification.save();
    } else if (postsCount === 100) {
      await Badge.findOneAndUpdate(
        { type: "post", userId },
        {
          name: "Keyboard Warrior",
          description: "User has created 100 posts",
          level: "diamond",
          criteria: "User must share 100 posts",
          userId,
          type: "post",
          icon: "🔥",
        },
        { upsert: true }
      );

      const notification = new Notification({
        receiverId: userId,
        type: "badge",
        linkId: `/profile/${userId}`,
        description: "You have earned a new badge - Keyboard Warrior",
      });

      await notification.save();
    } else if (postsCount === 500) {
      await Badge.findOneAndUpdate(
        { type: "post", userId },
        {
          name: "El mejor",
          description: "User has created 500 posts",
          level: "platinum",
          criteria: "User must share 500 posts",
          userId,
          type: "post",
          icon: "🌟",
        },
        { upsert: true }
      );

      const notification = new Notification({
        receiverId: userId,
        type: "badge",
        linkId: `/profile/${userId}`,
        description: "You have earned a new badge - El mejor posts del mundo",
      });

      await notification.save();
    }

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Image compression or post creation error:", err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const getFeedPosts = async (req, res) => {
  const { page, limit = 5 } = req.query;
  const id = req.user.id;

  let posts;

  try {
    const friendsPromise = await Friend.find({
      $or: [
        { sender: id, status: "accepted" },
        { receiver: id, status: "accepted" },
      ],
    });

    const friendsIds = friendsPromise.map((fr) => {
      return new mongoose.Types.ObjectId(fr.sender).toString() === id
        ? new mongoose.Types.ObjectId(fr.receiver)
        : new mongoose.Types.ObjectId(fr.sender);
    });

    const following = await Follow.find({ follower: id }).select("following");

    const followingIds = following.map(
      (f) => new mongoose.Types.ObjectId(f.following.toString())
    );

    if (followingIds.length > 0 || friendsIds.length > 0) {
      posts = await Post.find({
        $or: [
          { privacy: "friends", userId: { $in: friendsIds } },
          {
            privacy: "public",
            userId: { $in: [...friendsIds, ...followingIds] },
          },
        ],
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "_id firstName lastName picturePath verified");
    } else {
      posts = await Post.find({
        _id: "67c0e95cc6489e642bf59fee",
      })
        .sort({ createdAt: -1 })
        .populate("userId", "_id firstName lastName picturePath verified");
    }

    const postsWithIsLiked = await Promise.all(
      posts.map(async (post) => {
        const isLiked = await Like.findOne({
          userId: id,
          postId: post._id,
        });

        return { ...post._doc, isLiked: Boolean(isLiked) };
      })
    );

    let reposts = await Repost.find({
      $or: [
        { privacy: "friends", userId: { $in: friendsIds } },
        {
          privacy: "public",
          userId: { $in: [...friendsIds, ...followingIds] },
        },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * 4)
      .limit(4)
      .populate("userId", "firstName lastName picturePath verified _id")
      .populate({
        path: "postId",
        select: "_id userId description picturePath privacy createdAt",
        populate: {
          path: "userId",
          select: "_id firstName lastName picturePath verified",
        },
      });

    const repostsWithIsLiked = await Promise.all(
      reposts.map(async (rep) => {
        const isLiked = await Like.findOne({
          userId: id,
          repostId: rep._id,
        });

        const postId =
          (rep?.postId?.privacy === "private" &&
            rep.postId.userId._id.toString() !== id) ||
          (rep?.postId?.privacy === "friends" &&
            !friendsIds.includes(rep.postId.userId._id.toString()) &&
            rep.postId.userId._id.toString() !== id)
            ? null
            : rep.postId;

        return { ...rep._doc, isLiked: Boolean(isLiked), postId };
      })
    );

    posts = [...postsWithIsLiked, ...repostsWithIsLiked];

    if (followingIds.length > 0 || friendsIds.length > 0) {
      posts = posts.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (page === "1") {
      const followSuggestion = await User.find({
        _id: { $nin: [id, ...friendsIds, ...followingIds] },
      })
        .sort({ verified: -1, followersCount: -1 })
        .limit(30);

      posts = {
        suggestions: followSuggestion,
        posts: posts,
      };
    } else {
      posts = { posts };
    }

    res.status(200).json(posts);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  const { page, limit = 5 } = req.query;
  const { userId } = req.params;

  let userPosts;

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

    if (userId === req.user.id) {
      userPosts = await Post.find({ userId })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ pinned: -1, createdAt: -1 })
        .populate("userId", "_id firstName lastName picturePath verified");

      let reposts = await Repost.find({
        userId,
        $or: [
          { privacy: "public" },
          { privacy: "friends" },
          { privacy: "private" },
        ],
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 4)
        .limit(4)
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });

      userPosts = [...userPosts, ...reposts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        return b.createdAt - a.createdAt;
      });
    } else if (isFriend) {
      userPosts = await Post.find({
        userId,
        $or: [{ privacy: "public" }, { privacy: "friends" }],
      })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ pinned: -1, createdAt: -1 })
        .populate("userId", "_id firstName lastName picturePath verified");

      let reposts = await Repost.find({
        userId,
        $or: [{ privacy: "public" }, { privacy: "friends" }],
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 4)
        .limit(4)
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });

      userPosts = [...userPosts, ...reposts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        return b.createdAt - a.createdAt;
      });
    } else if (!isFriend) {
      userPosts = await Post.find({ userId, privacy: "public" })
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ pinned: -1, createdAt: -1 })
        .populate("userId", "_id firstName lastName picturePath verified");

      let reposts = await Repost.find({
        userId,
        privacy: "public",
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 4)
        .limit(4)
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });

      userPosts = [...userPosts, ...reposts].sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        return b.createdAt - a.createdAt;
      });
    }

    const postsWithIsLiked = await Promise.all(
      userPosts.map(async (post) => {
        const isLiked = await Like.findOne(
          typeof post.postId === "object"
            ? {
                userId: req.user.id,
                repostId: post._id,
              }
            : {
                userId: req.user.id,
                postId: post._id,
              }
        );

        const postId =
          (post?.postId?.privacy === "private" &&
            post.postId.userId._id.toString() !== req.user.id) ||
          (post?.postId?.privacy === "friends" &&
            !isFriend &&
            post.postId.userId._id.toString() !== req.user.id)
            ? null
            : post.postId;

        return { ...post._doc, isLiked: Boolean(isLiked), postId };
      })
    );

    const postsCount = await Post.countDocuments({ userId });
    const repostsCount = await Repost.countDocuments({ userId });

    const count = postsCount + repostsCount;

    res.status(200).json({ posts: postsWithIsLiked, count });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getPost = async (req, res) => {
  const { postId } = req.params;

  let post;

  try {
    post = await Post.findById(postId).populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    if (!post) {
      post = await Repost.findById(postId)
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });
    }

    if (post.userId._id.toString() !== req.user.id && post.privacy === "private") {
      res.status(403).json({ message: "Forbidden!" });
    } else {
      if (!post) {
        return res.status(404).json({ message: "Post is not found" });
      }

      const isLiked = await Like.findOne(
        typeof post.userId !== "object"
          ? {
              userId: req.user.id,
              postId: post._id,
            }
          : {
              userId: req.user.id,
              repostId: post._id,
            }
      );

      const postWithIsLiked = {
        ...post._doc,
        isLiked: Boolean(isLiked),
        reposted: typeof post.postId === "object" ? true : false,
      };

      res.status(200).json(postWithIsLiked);
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  let deletedPost;

  try {
    deletedPost = await Post.findById(id);

    if (deletedPost && deletedPost.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    if (deletedPost) {
      await Post.findByIdAndDelete(id);
      await Notification.deleteMany({ linkId: id });
      await Comment.deleteMany({ postId: id });
    } else {
      deletedPost = await Repost.findById(id).populate("postId", "_id");

      if (deletedPost && deletedPost.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden!" });
      }

      await Repost.findByIdAndDelete(id);
      await Post.findByIdAndUpdate(deletedPost.postId._id, {
        $inc: { shareCount: -1 },
      });
      await Notification.deleteMany({ linkId: id });
      await Comment.deleteMany({ repostId: id });
    }

    res.status(200).json(deletedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const editPost = async (req, res) => {
  const { postId } = req.params;

  let post;

  try {
    post = await Post.findById(postId).populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    if (post && post.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    if (post) {
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
      post = await Repost.findOne({ _id: postId });

      if (post && post.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden!" });
      }

      post.description = req.body.description;
      post.edited = true;

      const result = await post.save();

      const populatedResult = await Repost.findById(result._id)
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });

      const isLiked = await Like.findOne({
        userId: req.user.id,
        repostId: post._id,
      });

      const postWithIsLiked = {
        ...populatedResult._doc,
        isLiked: Boolean(isLiked),
      };

      res.status(200).json(postWithIsLiked);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const pinPost = async (req, res) => {
  const { postId } = req.params;

  let post;
  try {
    post = await Post.findById(postId).populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    if (post && post.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    if (post) {
      post.pinned = !post.pinned;
      await post.save();

      const isLiked = await Like.findOne({
        userId: req.user.id,
        postId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    } else {
      post = await Repost.findById(postId)
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });

      if (post && post.userId._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden!" });
      }

      post.pinned = !post.pinned;
      await post.save();

      const isLiked = await Like.findOne({
        userId: req.user.id,
        repostId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getPostClickInfo = async (req, res) => {
  const { postId } = req.params;
  let isLiked;

  try {
    const post = await Post.findById(postId)
      .select("likesCount commentCount userId")
      .populate("userId", "_id firstName lastName picturePath verified");

    const repost = await Repost.findById(postId);

    const checkLike = await Like.findOne({
      userId: req.user.id,
      postId: postId,
    });

    if (checkLike) {
      isLiked = true;
    } else {
      isLiked = false;
    }

    res.status(200).json({
      likesCount: post.likesCount,
      commentsCount: post.commentCount,
      isLiked,
      reposted: repost ? true : false,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const changePrivacy = async (req, res) => {
  const { postId } = req.params;

  let post;

  try {
    post = await Post.findById(postId).populate(
      "userId",
      "_id firstName lastName picturePath verified"
    );

    if (post && post.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden!" });
    }

    if (post) {
      post.privacy = req.body.privacy;
      await post.save();

      const isLiked = await Like.findOne({
        userId: req.user.id,
        postId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };
      res.status(200).json(postWithIsLiked);
    } else {
      post = await Repost.findByIdAndUpdate(
        postId,
        {
          privacy: req.body.privacy,
        },
        { new: true }
      )
        .populate("userId", "firstName lastName picturePath verified _id")
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select: "_id firstName lastName picturePath verified",
          },
        });

      if (post && post.userId._id.toString() !== req.user.id) {
        return res.status(403).json({ message: "Forbidden!" });
      }

      const isLiked = await Like.findOne({
        userId: req.user.id,
        repostId: post._id,
      });

      const postWithIsLiked = { ...post._doc, isLiked: Boolean(isLiked) };

      res.status(200).json(postWithIsLiked);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
