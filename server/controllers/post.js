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
      "_id firstName lastName picturePath verified isDuolingoStreak"
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
  const { page = 1, limit = 10 } = req.query;
  const userId = req.user.id;

  try {
    const friends = await Friend.find({
      status: "accepted",
      $or: [{ sender: userId }, { receiver: userId }],
    }).lean();
    const friendIds = friends.map((f) =>
      f.sender.toString() === userId
        ? f.receiver.toString()
        : f.sender.toString()
    );

    const followingDocs = await Follow.find({ follower: userId })
      .select("following")
      .lean();
    const followingIds = followingDocs.map((f) => f.following.toString());

    const fofRels = await Friend.find({
      status: "accepted",
      $or: [{ sender: { $in: friendIds } }, { receiver: { $in: friendIds } }],
    }).lean();
    let fofIds = fofRels.map((f) => {
      const other = friendIds.includes(f.sender.toString())
        ? f.receiver
        : f.sender;
      return other.toString();
    });
    fofIds = [...new Set(fofIds)].filter(
      (id) => id !== userId && !friendIds.includes(id)
    );

    const chronoPosts = await Post.find({
      $or: [
        { userId: { $in: friendIds }, privacy: { $in: ["friends", "public"] } },
        { userId: { $in: followingIds }, privacy: "public" },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(
        "userId",
        "_id firstName lastName picturePath verified isDuolingoStreak"
      )
      .lean();

    const chronoReposts = await Repost.find({
      $or: [
        { userId: { $in: friendIds }, privacy: { $in: ["friends", "public"] } },
        { userId: { $in: followingIds }, privacy: "public" },
      ],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate(
        "userId",
        "_id firstName lastName picturePath verified isDuolingoStreak"
      )
      .populate({
        path: "postId",
        select: "_id userId description picturePath privacy createdAt",
        populate: {
          path: "userId",
          select:
            "_id firstName lastName picturePath verified isDuolingoStreak",
        },
      })
      .lean();

    const [fofPosts, fofReposts] = await Promise.all([
      Post.find({ userId: { $in: fofIds }, privacy: "public" })
        .populate(
          "userId",
          "_id firstName lastName picturePath verified isDuolingoStreak"
        )
        .lean(),
      Repost.find({ userId: { $in: fofIds }, privacy: "public" })
        .populate(
          "userId",
          "_id firstName lastName picturePath verified isDuolingoStreak"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
          },
        })
        .lean(),
    ]);

    const scoreItems = (arr) =>
      arr.map((item) => {
        const hoursOld = (Date.now() - new Date(item.createdAt)) / 36e5;
        const recency = 1 / (1 + hoursOld);
        const base = recency * 3 + 1;
        return { item, score: base + Math.random() * 0.5 };
      });
    const weightedPosts = scoreItems(fofPosts).sort(
      (a, b) => b.score - a.score
    );
    const weightedReposts = scoreItems(fofReposts).sort(
      (a, b) => b.score - a.score
    );

    const recLimit = Math.floor(limit / 2);
    const recPosts = weightedPosts.slice(0, recLimit).map((w) => w.item);
    const recReposts = weightedReposts.slice(0, recLimit).map((w) => w.item);

    const attachLikes = async (arr) =>
      Promise.all(
        arr.map(async (obj) => {
          const liked =
            (await Like.exists({ userId, postId: obj._id })) ||
            (await Like.exists({ userId, repostId: obj._id }));
          return { ...obj, isLiked: Boolean(liked) };
        })
      );
    const [cp, cr, rp, rr] = await Promise.all([
      attachLikes(chronoPosts),
      attachLikes(chronoReposts),
      attachLikes(recPosts),
      attachLikes(recReposts),
    ]);

    const merged = [];
    let iP = 0,
      iR = 0,
      jP = 0,
      jR = 0;
    while (
      merged.length < limit &&
      (iP < cp.length || iR < cr.length || jP < rp.length || jR < rr.length)
    ) {
      const rand = Math.random();
      if (rand < 0.25 && jP < rp.length) merged.push(rp[jP++]);
      else if (rand < 0.5 && jR < rr.length) merged.push(rr[jR++]);
      else if (rand < 0.75 && iP < cp.length) merged.push(cp[iP++]);
      else if (iR < cr.length) merged.push(cr[iR++]);
      else if (iP < cp.length) merged.push(cp[iP++]);
      else if (jP < rp.length) merged.push(rp[jP++]);
    }

    let result;
    if (page == 1) {
      const suggestions = await User.find({
        _id: { $nin: [userId, ...friendIds, ...followingIds] },
      })
        .sort({ verified: -1, followersCount: -1 })
        .limit(30)
        .lean();
      result = { suggestions, posts: merged };
    } else {
      result = { posts: merged };
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error("getFeedPosts error:", err);
    return res.status(500).json({ message: err.message });
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
        .populate(
          "userId",
          "_id firstName lastName picturePath verified isDuolingoStreak"
        );

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
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
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
        .populate(
          "userId",
          "_id firstName lastName picturePath verified isDuolingoStreak"
        );

      let reposts = await Repost.find({
        userId,
        $or: [{ privacy: "public" }, { privacy: "friends" }],
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 4)
        .limit(4)
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
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
        .populate(
          "userId",
          "_id firstName lastName picturePath verified isDuolingoStreak"
        );

      let reposts = await Repost.find({
        userId,
        privacy: "public",
      })
        .sort({ createdAt: -1 })
        .skip((page - 1) * 4)
        .limit(4)
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
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
      "_id firstName lastName picturePath verified isDuolingoStreak"
    );

    if (!post) {
      post = await Repost.findById(postId)
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
          },
        });
    }

    if (
      post.userId._id.toString() !== req.user.id &&
      post.privacy === "private"
    ) {
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
      "_id firstName lastName picturePath verified isDuolingoStreak"
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
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
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
      "_id firstName lastName picturePath verified isDuolingoStreak"
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
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
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
      .populate(
        "userId",
        "_id firstName lastName picturePath verified isDuolingoStreak"
      );

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
      "_id firstName lastName picturePath verified isDuolingoStreak"
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
        .populate(
          "userId",
          "firstName lastName picturePath verified isDuolingoStreak _id"
        )
        .populate({
          path: "postId",
          select: "_id userId description picturePath privacy createdAt",
          populate: {
            path: "userId",
            select:
              "_id firstName lastName picturePath verified isDuolingoStreak",
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
