import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    edited: { type: Boolean, default: false },
    pinned: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    shareCount: { type: Number, default: 0 },
    description: { type: String, maxlength: 2000 },
    privacy: { type: String, default: "public" },
    location: String,
    picturePath: String,
    textAddition: Object,
  },
  { timestamps: true }
);

const Post = mongoose.model("post", postSchema);

export default Post;
