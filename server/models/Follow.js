import mongoose from "mongoose";

const followSchema = new mongoose.Schema(
  {
    follower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    following: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ follower: 1, following: 1 }, { unique: true }); // Prevents duplicate follows

const Follow = mongoose.model("follow", followSchema);

export default Follow;
