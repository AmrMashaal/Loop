/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import WidgetWrapper from "../WidgetWrapper";
import { useSelector } from "react-redux";
import { VerifiedOutlined } from "@mui/icons-material";
import { Box, useMediaQuery, useTheme } from "@mui/system";
import { Button, Typography } from "@mui/material";
import UserImage from "../UserImage";
import { Link } from "react-router-dom";
import _ from "lodash";
import ProfileFriendsSkeleton from "../../scenes/skeleton/ProfileFriendsSkeleton";

const ProfileFriends = ({ userParam }) => {
  const [page, setPage] = useState(1);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = useSelector((state) => state.token);

  const isNonMobileScreens = useMediaQuery("(min-width: 555px)");

  const { palette } = useTheme();

  const handleGetFriends = async (initial = false) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/friends/${userParam}/friends?page=${page}&isProfile=true`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (initial) {
        setFriends(data);
      } else {
        setFriends((prev) => {
          return {
            friends: _.uniqBy([...prev.friends, ...data.friends], "_id"),
            count: prev.count,
          };
        });
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
    if (page === 1) {
      handleGetFriends(true);
    } else {
      handleGetFriends();
    }
  }, [page, userParam]);

  return (
    <WidgetWrapper>
      <Typography
        sx={{ userSelect: "none" }}
        fontSize="24px"
        textTransform="uppercase"
        fontWeight="bold"
      >
        Friends
      </Typography>

      <Box display="grid" gridTemplateColumns="repeat(4, minmax(0, 1fr))">
        {friends?.friends?.map((friend) => (
          <Link
            style={{
              gridColumn: isNonMobileScreens ? "span 2" : "span 4",
              margin: "13px 10px",
            }}
            className="opacityBox"
            key={
              friend.sender._id === userParam
                ? friend.receiver._id
                : friend.sender._id
            }
            to={`/profile/${
              friend.sender._id === userParam
                ? friend.receiver._id
                : friend.sender._id
            }`}
          >
            <Box display="flex" alignItems="center" gap="10px">
              <UserImage
                image={
                  friend.sender._id === userParam
                    ? friend.receiver.picturePath
                    : friend.sender.picturePath
                }
                size="60px"
              />

              <Box display="flex" gap="8px">
                <Typography
                  maxWidth="135px"
                  overflow="hidden"
                  textOverflow="ellipsis"
                  whiteSpace="nowrap"
                >
                  {friend.sender._id === userParam
                    ? friend.receiver.firstName
                    : friend.sender.firstName}{" "}
                  {friend.sender._id === userParam
                    ? friend.receiver.lastName
                    : friend.sender.lastName}
                </Typography>

                {friend.sender._id === userParam
                  ? friend.receiver.verified && (
                      <VerifiedOutlined
                        sx={{
                          fontSize: "20px",
                          color: "#00D5FA",
                        }}
                      />
                    )
                  : friend.sender.verified && (
                      <VerifiedOutlined
                        sx={{
                          fontSize: "20px",
                          color: "#00D5FA",
                        }}
                      />
                    )}
              </Box>
            </Box>
          </Link>
        ))}

        {loading && (
          <Box sx={{ gridColumn: "span 4" }}>
            <ProfileFriendsSkeleton />
          </Box>
        )}

        {!loading && friends.friends.length === 0 && (
          <Typography
            my="10px"
            fontSize="17px"
            color={palette.neutral.medium}
            textAlign="center"
            sx={{ gridColumn: "span 4" }}
          >
            Doesn&apos;t Have Friends Yet
          </Typography>
        )}

        {friends?.friends?.length !== friends?.count && (
          <Button
            sx={{
              whiteSpace: "nowrap",
              padding: "5px 20px",
              border: "2px solid",
              fontWeight: "500",
              fontSize: "13px",
              borderRadius: "20px",
              width: "160px",
              display: "block",
              margin: "20px auto 0",
              gridColumn: "span 4",
            }}
            onClick={() => setPage((prev) => prev + 1)}
          >
            More
          </Button>
        )}
      </Box>
    </WidgetWrapper>
  );
};

export default ProfileFriends;
