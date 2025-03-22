import express from "express";
import { verifyToken } from "../middleware/auth.js";
import { followUser, getFollowers, isFollower } from "../controllers/follow.js";

const router = express.Router();

router.get("/:userId", verifyToken, getFollowers);
router.get("/:userId/isFollower", verifyToken, isFollower);

router.post("/:userId", verifyToken, followUser);

export default router;
