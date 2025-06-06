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

const HomePage = ({ socket, newPosts, setNewPosts }) => {
  const [loading, setLoading] = useState(true);
  const [wrongPassword, setWrongPassword] = useState(false);

  const { _id, picturePath } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);

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
      p={isNonMobileScreens ? "5rem 1rem 1rem" : "4.5rem 1rem 1rem"}
    >
      <Navbar />
      <Box
        display="flex"
        gap="10px"
        justifyContent="space-between"
        flexDirection={!isNonMobileScreens ? "column" : ""}
      >
        {isNonMobileScreens && (
          <Box flexBasis="24%">
            <FriendsWidget
              handleUserFriend={handleUserFriend}
              loading={loading}
              setLoading={setLoading}
              description="Friends"
              type="navFriends"
              userId={user._id}
            />
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
          <Box flexBasis={isNonMobileScreens ? "24%" : undefined}>
            <UserWidget userId={_id} picturePath={picturePath} />
          </Box>
        )}
      </Box>

      {wrongPassword && <WrongPassword />}
    </Box>
  );
};

export default HomePage;
