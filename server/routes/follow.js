import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  followUser,
  getFollowers,
  getFollowing,
  isFollower,
} from "../controllers/follow.js";

const router = express.Router();

router.get("/:userId/followers", verifyToken, getFollowers);
router.get("/:userId/following", verifyToken, getFollowing);
router.get("/:userId/isFollower", verifyToken, isFollower);

router.post("/:userId", verifyToken, followUser);

export default router;
