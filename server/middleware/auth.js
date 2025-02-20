import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) return res.status(403).json({ message: "not authorized" });

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verfiyed = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verfiyed;
    next();
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
