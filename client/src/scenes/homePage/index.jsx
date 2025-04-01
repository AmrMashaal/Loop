/* eslint-disable react/prop-types */
import { Box, useMediaQuery } from "@mui/material";
import Navbar from "../navbar";
import UserWidget from "../widgets/UserWidget";
import { useDispatch, useSelector } from "react-redux";
import MyPostWidget from "../widgets/MyPostWidget";
import PostsWidget from "../widgets/PostsWidget";
import FriendsWidget from "../widgets/FriendsWidget";
import { useEffect, useState } from "react";
import { setFriends } from "../../../state";
import WrongPassword from "../../components/WrongPassword";

const HomePage = ({
  socket,
  newPosts,
  setNewPosts,
  onlineFriends,
  setOnlineFriends,
}) => {
  const [loading, setLoading] = useState(true);
  const [wrongPassword, setWrongPassword] = useState(false);

  const { _id, picturePath } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);

  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const dispatch = useDispatch();

  const handleUserFriend = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/users/${user._id}/friends`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const friends = await response.json();
      dispatch(setFriends({ friends: friends }));
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const checkCorrectPassword = async () => {
    try {
      const response = await fetch(
        `/api/users/${user._id}/checkCorrectPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ passwordChangedAt: user.passwordChangedAt }),
        }
      );

      const result = await response.json();

      if (result.message === "Password is not correct") {
        setWrongPassword(true);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    checkCorrectPassword();
  }, []);

  document.title = "Loop";

  return (
    <Box
      position="relative"
      className="homeContainer"
      mb={!isNonMobileScreens ? "71px" : ""}
    >
      <Box
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(27 102 176 / 19%)"
        top="-200px"
        left="-172px"
        zIndex="10"
        sx={{
          opacity: mode === "light" ? "0.1" : "0.07",
          background:
            "radial-gradient(circle, rgb(30 144 255 / 65%), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

      <Box
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(255 31 198 / 13%)"
        bottom="-200px"
        right="-172px"
        zIndex="10"
        sx={{
          opacity: mode === "light" ? "0.1" : "0.1",
          background:
            "radial-gradient(circle, rgb(255 31 223 / 63%), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

      <Navbar />

      <Box
        p={isNonMobileScreens ? "5rem 1rem 1rem" : "4.2rem 1rem 1rem"}
        display="flex"
        gap="10px"
        justifyContent="space-between"
        flexDirection={!isNonMobileScreens ? "column" : ""}
      >
        {!isNonMobileScreens && (
          <Box flexBasis="26%">
            <FriendsWidget
              handleUserFriend={handleUserFriend}
              loading={loading}
              setLoading={setLoading}
              description="online friends"
              userId={user._id}
              onlineFriends={onlineFriends}
              type="onlineFriends"
              setOnlineFriends={setOnlineFriends}
            />
          </Box>
        )}
        {isNonMobileScreens && (
          <Box flexBasis={isNonMobileScreens ? "26%" : undefined}>
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>
        )}
        <Box flexBasis={isNonMobileScreens ? "42%" : undefined}>
          <MyPostWidget picturePath={picturePath} socket={socket} />
          <PostsWidget
            socket={socket}
            newPosts={newPosts}
            setNewPosts={setNewPosts}
          />
        </Box>
        {isNonMobileScreens && (
          <Box flexBasis="26%">
            <FriendsWidget
              handleUserFriend={handleUserFriend}
              loading={loading}
              setLoading={setLoading}
              description="online friends"
              type="onlineFriends"
              setOnlineFriends={setOnlineFriends}
              onlineFriends={onlineFriends}
              userId={user._id}
            />
          </Box>
        )}
      </Box>

      {wrongPassword && <WrongPassword />}
    </Box>
  );
};

export default HomePage;
