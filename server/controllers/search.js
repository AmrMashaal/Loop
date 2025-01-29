import User from "../models/User.js";
import Post from "../models/Post.js";

export const searchInfo = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const { type, info } = req.params;
  const [firstWord, secondWord] = info.split(" ");

  try {
    if (type === "users") {
      let users = await User.find({
        $or: [
          { firstName: { $regex: firstWord, $options: "i" } },
          ...(secondWord
            ? [{ lastName: { $regex: secondWord, $options: "i" } }]
            : []),
          { username: { $regex: firstWord, $options: "i" } },
        ],
      })
        .limit(10)
        .skip((page - 1) * 10)
        .sort({ verified: -1, firstName: 1 });

      const usersWithoutPassword = users.map((user) => {
        const { password, ...dataWithoutPassword } = user.toObject();
        return dataWithoutPassword;
      });

      return res.status(200).json(usersWithoutPassword);
    } else if (type === "posts") {
      const posts = await Post.find({
        description: { $regex: info, $options: "i" },
      })
        .limit(5)
        .skip((page - 1) * 5)
        .sort({ description: 1 });

      return res.status(200).json(posts);
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
