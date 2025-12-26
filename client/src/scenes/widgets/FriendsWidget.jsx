/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import OnlineFriends from "../../components/friends/OnlineFriends";
import UserFriends from "../../components/friends/UserFriends";
import { Link } from "react-router-dom";
import { Box, useTheme } from "@mui/system";

// eslint-disable-next-line react/prop-types
const FriendsWidget = ({ userId, description, type, isNonMobileScreens }) => {
  const [loading, setLoading] = useState(true);
  const [userFriends, setUserFriends] = useState([]);
  const [page, setPage] = useState(1);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const { palette } = useTheme();

  const handleUserFriend = async (initial = false) => {
    if (page === 1) setLoading(true);

    try {
      const response = await fetch(
        ` /api/friends/${userId}/friends?isProfile=true&&page=${page}&&isNavFriends=${
          type === "navFriends" ? "true" : "false"
        }`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const friends = await response.json();

      if (response.ok) {
        if (initial) {
          setUserFriends(friends);
        } else {
          setUserFriends((prev) => ({
            friends: [...prev.friends, ...friends.friends],
            count: friends.count,
          }));
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1) handleUserFriend(true);
    else {
      handleUserFriend();
    }
  }, [userId, page]);

  return (
    <Box
      position="sticky"
      top="80px"
      height={isNonMobileScreens ? "100vh" : "unset"}
      className="gradientBorderRight"
      padding={type === "navFriends" ? undefined : "14px 25px"}
    >
      <Box
        display={type === "navFriends" ? undefined : "flex"}
        justifyContent={type === "navFriends" ? undefined : "space-between"}
        alignContent={type === "navFriends" ? undefined : "center"}
      >
        <Typography
          fontSize={isNonMobileScreens ? "20px" : "16px"}
          fontWeight="500"
          sx={{ userSelect: "none", textTransform: "capitalize" }}
        >
          {description}
        </Typography>

        {!loading && userFriends?.count !== 0 && type !== "navFriends" && (
          <Link
            style={{
              userSelect: "none",
              textTransform: "capitalize",
              fontWeight: "500",
              fontSize: isNonMobileScreens ? "15px" : "14px",
              color: palette.primary.main,
            }}
            className="linkUnderline"
            to={`/profile/${userId}/friends`}
          >
            see all friends
          </Link>
        )}
      </Box>

      {type !== "navFriends" && (
        <Typography
          mt="1px"
          fontSize={isNonMobileScreens ? "14px" : "12px"}
          color="#a9a4a4"
          fontWeight="500"
          sx={{ userSelect: "none" }}
        >
          {!loading &&
            userFriends?.count !== 0 &&
            description !== "friends" &&
            userFriends?.count}{" "}
          {!loading &&
            userFriends?.count !== 0 &&
            description !== "friends" &&
            (userFriends?.count > 1 ? "friends" : "friend")}
        </Typography>
      )}

      {type === "navFriends" && (
        <OnlineFriends
          navFriends={userFriends}
          loading={loading}
          setPage={setPage}
        />
      )}

      {type !== "navFriends" && (
        <UserFriends
          userFriends={userFriends}
          loading={loading}
          user={user}
          userId={userId}
          isNonMobileScreens={isNonMobileScreens}
        />
      )}
    </Box>
  );
};

export default FriendsWidget;
