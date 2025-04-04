import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "comment", "message", "newPost", "reply", "badge", "follow"],
      required: true,
    },
    description: { type: String, required: true },
    linkId: { type: String, required: true },
    watched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.notification ||
  mongoose.model("notification", notificationSchema);

export default Notification;
