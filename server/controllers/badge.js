import Badge from "../models/badge.js";

export const getBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ userId: req.user.id });

    res.status(200).json(badges);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
