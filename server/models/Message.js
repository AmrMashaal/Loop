import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    picturePath: String,
    text: { type: String, maxlength: 1500 },
    watched: { type: Boolean, default: false },
    emoji: {type: Map, of: String, default: {}},
    reply: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "message",
    },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("message", messageSchema);

export default Message;
