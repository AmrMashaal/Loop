import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: "Too many login/signup attempts. Please try again later.",
});

export const messageLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: "Too many messages sent. Please wait.",
});

export const postLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5,
  message: "Too many posts. Please wait.",
});

export const commentLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 10,
  message: "Too many comments. Slow down!",
});

export const replyLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 15,
  message: "Too many replies. Please slow down!",
});
