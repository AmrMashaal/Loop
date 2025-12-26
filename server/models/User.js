import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    lastName: {
      type: String,
      default: "",
      minlength: 2,
      maxlength: 20,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      maxlength: 20,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8 },
    gender: { type: String, required: true },
    birthdate: { type: String, required: true },
    picturePath: { type: String, default: "" },
    background: { type: String, default: "" },
    bio: { type: String, default: "", trim: true, maxlength: 101 },
    verified: { type: Boolean, default: false },
    online: { type: Boolean, default: false },
    chatHistory: { type: Map, of: Object, default: {} },
    passwordChangedAt: { type: String, default: "" },
    links: {
      facebook: String,
      x: String,
      instagram: String,
      linkedin: String,
    },
    location: { type: String, required: true },
    occupation: { type: String, maxlength: 50, default: "" },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    isDuolingoStreak: Boolean,
  },
  { timestamps: true }
);

const User = mongoose.model("user", userSchema);

export default User;
