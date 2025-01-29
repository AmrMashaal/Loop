import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    picturePath: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: String,
    type: {
      type: String,
      enum: ["like", "comment", "message", "newPost", "reply"],
      required: true,
    },
    description: { type: String, required: true },
    linkId: { type: String, required: true },
    watched: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model("notification", notificationSchema);

export default Notification;
