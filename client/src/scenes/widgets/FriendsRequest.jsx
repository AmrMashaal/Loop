/* eslint-disable react/prop-types */
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
  setFriendRequestData,
  requestLoading,
}) => {
  const token = useSelector((state) => state.token);

  // -------------------------------------------------------
  const acceptFriend = async (friendId) => {
    try {
      const response = await fetch(`/api/friends/${friendId}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setFriendRequestData((prev) =>
          prev.filter((ele) => {
            return ele._id !== friendId;
          })
        );
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setFriendRequestData((prev) => {
        return prev.filter((ele) => {
          return ele._id !== friendId;
        });
      });
    }
  };
  // -------------------------------------------------------

  const refuseFriend = async (friendId) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setFriendRequestData((prev) =>
          prev.filter((ele) => {
            return ele._id !== friendId;
          })
        );
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setFriendRequestData((prev) => {
        return prev.filter((ele) => {
          return ele._id !== friendId;
        });
      });
    }
  };

  return (
    <TasksComponent
      open={openRequests}
      setOpen={setOpenRequests}
      description="Friend Request"
    >
      {!requestLoading &&
        friendsRequestData.length !== 0 &&
        friendsRequestData?.map((request) => {
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
                            color: "#15a1ed",
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

      {!requestLoading && friendsRequestData.length === 0 && (
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

      {requestLoading && (
        <Box className="loadingAnimation" width="30px" height="30px"></Box>
      )}
    </TasksComponent>
  );
};

export default FriendsRequest;
