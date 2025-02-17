/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import OnlineFriends from "../../components/friends/OnlineFriends";
import UserFriends from "../../components/friends/UserFriends";
import FlexBetween from "../../components/FlexBetween";
import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const FriendsWidget = ({
  userId,
  description,
  onlineFriends,
  type,
  setOnlineFriends,
  isNonMobileScreens,
}) => {
  const [loading, setLoading] = useState(true);
  const [userFriends, setUserFriends] = useState([]);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);


  const handleUserFriend = async () => {
    if (type === "friends") {
      setLoading(true);
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/friends/${userId}/friends?isProfile=true`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const friends = await response.json();

        setUserFriends(friends);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOnlineFriends = async () => {
    if (type === "onlineFriends") {
      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/users/${userId}/onlineFriends`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const onlineFriends = await response.json();
        setOnlineFriends(onlineFriends);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (type === "friends") {
      handleUserFriend();
    } else if (type === "onlineFriends") {
      handleOnlineFriends();
    }
  }, [userId]);

  return (
    <WidgetWrapper position="sticky" top="87px">
      <FlexBetween>
        <Typography
          fontSize={isNonMobileScreens ? "20px" : "16px"}
          fontWeight="500"
          sx={{ userSelect: "none", textTransform: "capitalize" }}
        >
          {description}
        </Typography>

        {!loading &&
          userFriends?.count !== 0 &&
          description !== "online friends" && (
            <Link
              style={{
                userSelect: "none",
                textTransform: "capitalize",
                fontWeight: "500",
                fontSize: isNonMobileScreens ? "15px" : "14px",
                color: "#00D5FA",
              }}
              className="linkUnderline"
              to={`/profile/${userId}/friends`}
            >
              see all friends
            </Link>
          )}
      </FlexBetween>

      <Typography
        mt="1px"
        fontSize={isNonMobileScreens ? "14px" : "12px"}
        color="#a9a4a4"
        fontWeight="500"
        sx={{ userSelect: "none" }}
      >
        {!loading &&
          userFriends?.count !== 0 &&
          description !== "online friends" &&
          userFriends?.count}{" "}
        {!loading &&
          userFriends?.count !== 0 &&
          description !== "online friends" &&
          (userFriends?.count > 1 ? "friends" : "friend")}
      </Typography>

      {type === "onlineFriends" && (
        <OnlineFriends
          onlineFriends={onlineFriends}
          loading={loading}
          user={user}
          userId={user._id}
        />
      )}

      {type === "friends" && (
        <UserFriends
          userFriends={userFriends}
          loading={loading}
          user={user}
          userId={userId}
          isNonMobileScreens={isNonMobileScreens}
        />
      )}
    </WidgetWrapper>
  );
};

export default FriendsWidget;
