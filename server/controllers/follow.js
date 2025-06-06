import mongoose from "mongoose";
import Follow from "../models/Follow.js";
import Notification from "../models/notification.js";
import User from "../models/User.js";

export const followUser = async (req, res) => {
  const { userId } = req.params;
  const myId = req.user.id;

  if (userId === myId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: "Invalid user ID" });
  }

  let followResult;

  try {
    const isFollower = await Follow.findOne({
      follower: myId,
      following: userId,
    });

    if (isFollower) {
      followResult = await Follow.findOneAndDelete({
        follower: myId,
        following: userId,
      });

      followResult = null;

      await User.findByIdAndUpdate(userId, {
        $inc: { followersCount: -1 },
      });

      await User.findByIdAndUpdate(myId, {
        $inc: { followingCount: -1 },
      });

      await Notification.deleteMany({
        type: "follow",
        receiverId: userId,
        senderId: myId,
      });
    } else {
      const follow = new Follow({
        follower: myId,
        following: userId,
      });

      followResult = await follow.save();

      const firstName = await User.findById(myId, "firstName");

      await User.findByIdAndUpdate(userId, {
        $inc: { followersCount: 1 },
      });

      await User.findByIdAndUpdate(myId, {
        $inc: { followingCount: 1 },
      });

      const notification = new Notification({
        type: "follow",
        description: `${firstName.firstName} started following you`,
        linkId: `/profile/${myId}`,
        receiverId: userId,
        senderId: myId,
      });

      await notification.save();
    }

    res.status(200).json(followResult);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getFollowers = async (req, res) => {
  const { userId } = req.params;

  const { page = 1, limit = 10 } = req.query;

  try {
    const followers = await Follow.find({ following: userId })
      .populate("follower", "firstName lastName username picturePath verified _id")
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(followers);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const getFollowing = async (req, res) => {
  const { userId } = req.params;

  const { page = 1, limit = 10 } = req.query;

  try {
    const following = await Follow.find({ follower: userId })
      .populate("following", "firstName lastName username picturePath verified _id")
      .limit(limit)
      .skip((page - 1) * limit);

    res.status(200).json(following);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const isFollower = async (req, res) => {
  const { userId } = req.params;
  const myId = req.user.id;

  if (userId === myId) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).json({ message: "Invalid user ID" });
  }

  try {
    const follower = await Follow.findOne({
      follower: myId,
      following: userId,
    });

    const isFollower = follower ? true : false;

    res.status(200).json(isFollower);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
