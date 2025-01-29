import User from "../models/User.js";
import Post from "../models/Post.js";
import sharp from "sharp";
import { v4 } from "uuid";
import path from "path";
import bcrypt from "bcrypt";
import Friend from "../models/Friend.js";

// ---------------------------------------------------------------

export const getUser = async (req, res) => {
  const id = req.params.id;

  try {
    let user = await User.findOne({ _id: id });

    const { password, ...dataWithoutPassword } = user.toObject();

    res.status(200).json(dataWithoutPassword);
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }
    if (user?.friends?.includes(friendId)) {
      user.friends = user.friends.filter((id) => {
        return id !== friendId;
      });

      friend.friends = friend.friends.filter((friendFriends) => {
        return friendFriends !== id;
      });
    } else if (friend?.friendsRequest?.includes(id)) {
      friend.friendsRequest = friend.friendsRequest.filter((Request) => {
        return Request !== id;
      });
    } else {
      friend.friendsRequest.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formatted = friends.map(
      ({ _id, firstName, lastName, location, occupation, picturePath }) => {
        return { _id, firstName, lastName, location, occupation, picturePath };
      }
    );

    res.status(200).json(formatted);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const acceptFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    user.friendsRequest = user.friendsRequest.filter((request) => {
      return request !== friendId;
    });

    user.friends.push(friendId);
    friend.friends.push(id);

    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formatted = friends.map(
      ({ _id, firstName, lastName, location, occupation, picturePath }) => {
        return { _id, firstName, lastName, location, occupation, picturePath };
      }
    );

    res.status(200).json(formatted);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const refuseFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ message: "User or friend not found" });
    }

    user.friendsRequest = user.friendsRequest.filter((request) => {
      return request !== friendId;
    });

    await user.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );

    const formatted = friends.map(
      ({ _id, firstName, lastName, location, occupation, picturePath }) => {
        return { _id, firstName, lastName, location, occupation, picturePath };
      }
    );

    res.status(200).json(formatted);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

const compressImage = async (buffer) => {
  return await sharp(buffer)
    .resize({ width: 1200 })
    .jpeg({ quality: 90 })
    .toBuffer();
};

export const editUser = async (req, res) => {
  let picturePath = null;
  let background = null;

  if (req.file) {
    if (req.body.picturePath && !req.body.background) {
      try {
        const uniqueImageName = `${v4()}-${req.file.originalname}`;
        const compressedBuffer = await compressImage(req.file.buffer);
        const filePath = path.join(
          process.cwd(),
          "public/assets",
          uniqueImageName
        );

        // Save the compressed image to the file system
        await sharp(compressedBuffer).toFile(filePath);
        req.file.path = filePath; // Update file path for potential future use
        picturePath = uniqueImageName;
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    } else if (req.body.background && !req.body.picturePath) {
      try {
        const uniqueImageName = `${v4()}-${req.file.originalname}`;
        const compressedBuffer = await compressImage(req.file.buffer);
        const filePath = path.join(
          process.cwd(),
          "public/assets",
          uniqueImageName
        );

        // Save the compressed image to the file system
        await sharp(compressedBuffer).toFile(filePath);
        req.file.path = filePath; // Update file path for potential future use
        background = uniqueImageName;
      } catch (err) {
        res.status(500).json({ message: err.message });
      }
    }
  }

  try {
    const { id, usernameParam } = req.params;
    const {
      firstName,
      lastName,
      username,
      birthdate,
      gender,
      bio,
      location,
      occupation,
      facebook,
      instagram,
      linkedin,
      x,
      youtube,
    } = req.body;

    const user = await User.findById(id);
    const isUserName = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (isUserName && isUserName._id.toString() !== id) {
      return res.status(404).json({ message: "Username exists" });
    }

    user.firstName = firstName;
    user.lastName = lastName;
    user.birthdate = birthdate;
    user.gender = gender;
    user.bio = bio;
    user.location = location;
    user.occupation = occupation;
    user.links.facebook = facebook;
    user.links.instagram = instagram;
    user.links.linkedin = linkedin;
    user.links.x = x;
    user.links.youtube = youtube;
    if (usernameParam !== username) {
      user.username = username;
    } else if (background) {
      user.background = background;
    } else if (picturePath) {
      user.picturePath = picturePath;
    }

    if (picturePath) {
      await Post.updateMany(
        {
          userId: id,
        },
        {
          $set: {
            userPicturePath: picturePath,
          },
        }
      );
    }

    await Post.updateMany(
      {
        userId: id,
      },
      {
        $set: {
          firstName: firstName,
          lastName: lastName,
        },
      }
    );

    const updatedUser = await user.save();

    const { password, ...UserData } = updatedUser.toObject();

    res.status(200).json(UserData);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const getChatHistory = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.chatHistory);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const modifyChatHistory = async (req, res) => {
  const { id, receivedId } = req.params;

  try {
    const user = await User.findById(id);
    const receivedUser = await User.findById(receivedId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.chatHistory.set(receivedId, {
      text: req.body.text,
      senderId: req.body.senderId,
      userInfo: {
        _id: receivedUser._id,
        firstName: receivedUser.firstName,
        lastName: receivedUser.lastName,
        picturePath: receivedUser.picturePath,
      },
      time: req.body.time,
    }); // set(KEY, VALUE) used to handle Map object

    receivedUser.chatHistory.set(id, {
      text: req.body.text,
      senderId: req.body.senderId,
      userInfo: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        picturePath: user.picturePath,
      },
      time: req.body.time,
    });

    await user.save();
    await receivedUser.save();

    res.status(200).json(user.chatHistory);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const changePassword = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const isCorrect = await bcrypt.compare(
      req.body.oldPassword,
      user?.password
    );

    if (!isCorrect) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();

    await user.save();

    res
      .status(200)
      .json({ message: "The password has been changed successfully" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const checkCorrectPassword = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.passwordChangedAt !== req.body.passwordChangedAt) {
      return res.status(404).json({ message: "Password is not correct" });
    }

    res.status(200).json({ message: "Correct password" });
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const getOnlineFriends = async (req, res) => {
  const { id } = req.params;

  try {
    const friends = await Friend.find({
      $or: [{ sender: id }, { receiver: id }],
      status: "accepted",
    })
      .populate(
        "sender receiver",
        "_id firstName lastName picturePath online occupation"
      )
      .limit(6);

    if (!friends) {
      return res.status(404).json({ message: "User not found" });
    }

    const onlineFriends = friends.filter(
      (friend) =>
        (friend.sender._id.toString() === id && friend.receiver.online) ||
        (friend.receiver._id.toString() === id && friend.sender.online)
    );

    res.status(200).json(onlineFriends);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ---------------------------------------------------------------

export const changeOnlineStatus = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.makeOnline) {
      user.online = true;
    } else {
      user.online = false;
    }

    const updatedUser = await user.save();

    res
      .status(200)
      .json({ message: `User is ${user.online ? "online" : "offline"}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
