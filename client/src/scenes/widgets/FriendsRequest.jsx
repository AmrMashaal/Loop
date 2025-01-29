/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import TasksComponent from "../../components/TasksComponent";
import FlexBetween from "../../components/FlexBetween";
import UserImage from "../../components/UserImage";
import { Box } from "@mui/system";
import { Button, Typography } from "@mui/material";
import { VerifiedOutlined } from "@mui/icons-material";
import { Link } from "react-router-dom";

// eslint-disable-next-line react/prop-types
const FriendsRequest = ({
  openRequests,
  setOpenRequests,
  friendsRequestData,
  setIsMobileMenuToggled,
  setFriendRequestData,
}) => {
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  // -------------------------------------------------------
  const acceptFriend = async (friendId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/${friendId}/accept`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setFriendRequestData((prev) =>
          prev.filter((ele) => {
            return ele._id !== friendId;
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };
  // -------------------------------------------------------

  const refuseFriend = async (friendId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/${friendId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setFriendRequestData((prev) =>
          prev.filter((ele) => {
            return ele._id !== friendId;
          })
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <TasksComponent
      open={openRequests}
      setOpen={setOpenRequests}
      description="Friend Request"
    >
      {friendsRequestData.length !== 0 &&
        friendsRequestData?.map((request) => {
          console.log(request);
          if (request?._id === undefined) {
            return;
          }
          return (
            <Box key={request?._id} my="4px">
              <FlexBetween
                borderRadius="4px"
                p="5px"
                sx={{
                  cursor: "pointer",
                  gap: "15px",
                  transition: "background-color .3s, padding-left 1s",
                  ":hover": {
                    backgroundColor: "#8080801f",
                    pl: "20px",
                  },
                }}
              >
                <Link
                  to={`/profile/${request?._id}`}
                  onClick={() => {
                    setOpenRequests(false);
                    setIsMobileMenuToggled(false);
                  }}
                >
                  <Box display="flex" alignItems="center" gap="10px">
                    <UserImage image={request?.picturePath} />
                    <Box display="flex" alignItems="center" gap="4px">
                      <Typography
                        maxWidth="95px"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                      >
                        {request?.firstName || "Undefined"} {request?.lastName}
                      </Typography>
                      {request?.verified && (
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
                <Box display="flex" gap="10px">
                  <Button
                    sx={{
                      bgcolor: "#57575780",
                      color: "white",
                      ":hover": {
                        bgcolor: "#44444480",
                      },
                    }}
                    onClick={() => acceptFriend(request?._id)}
                  >
                    accept
                  </Button>
                  <Button
                    sx={{
                      bgcolor: "#9e1125b3",
                      color: "white",
                      ":hover": {
                        bgcolor: "#760e1d47",
                      },
                    }}
                    onClick={() => refuseFriend(request?._id)}
                  >
                    refuse
                  </Button>
                </Box>
              </FlexBetween>
            </Box>
          );
        })}
      {friendsRequestData.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography fontSize="25px">There is no friend request</Typography>
        </Box>
      )}
    </TasksComponent>
  );
};

export default FriendsRequest;
