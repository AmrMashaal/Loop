/* eslint-disable react/prop-types */
import { Box } from "@mui/system";
import TasksComponent from "../../components/TasksComponent";
import UserImage from "../../components/UserImage";
import { Link } from "react-router-dom";
import { Typography } from "@mui/material";
import {
  DeleteOutline,
  FavoriteOutlined,
  MessageOutlined,
  Newspaper,
  Comment,
  Reply,
  Star,
  Person,
} from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { useEffect } from "react";
import { debounce } from "lodash";
import { useSelector } from "react-redux";
import _ from "lodash";

const NotificationData = ({
  openNotification,
  notificationsState,
  setIsNotification,
  setIsDeleteNotifications,
  getMoreNotifications,
}) => {
  const { palette } = useTheme();
  const medium = palette.neutral.medium;

  const user = useSelector((state) => state.user);

  const timeAgo = (postDate) => {
    const timeNow = new Date();
    const postTime = new Date(postDate);
    const seconds = Math.floor((timeNow - postTime) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) {
      return "Just now";
    } else if (minutes < 60) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (days < 30) {
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (months < 12) {
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else if (years >= 1) {
      return `${years} year${days > 1 ? "s" : ""} ago`;
    }
  };

  useEffect(() => {
    const notificationsParent = document.getElementById("notificationsParent");

    const scrollFunction = debounce(() => {
      if (
        notificationsParent.scrollTop + notificationsParent.clientHeight + 80 >=
        notificationsParent.scrollHeight
      ) {
        getMoreNotifications();
      }
    }, 300);

    notificationsParent.addEventListener("scroll", scrollFunction);

    return () => {
      notificationsParent.removeEventListener("scroll", scrollFunction);
    };
  }, []);

  return (
    <TasksComponent
      description="Notifications"
      open={openNotification}
      setOpen={setIsNotification}
      id="notificationsParent"
    >
      {notificationsState?.length > 0 && (
        <Box
          padding="2px 5px"
          border="2px solid#878787"
          width="30px"
          mb="-57px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          borderRadius="4px"
          fontSize="15px"
          whiteSpace="nowrap"
          position="sticky"
          overflow="hidden"
          minHeight="43px"
          top="52px"
          alignSelf="end"
          zIndex="1"
          color="#878787"
          bgcolor={palette.neutral.light}
          sx={{
            cursor: "pointer",
            transition: ".5s",
            userSelect: "none",
            ":hover": {
              color: "red",
              width: "200px",
              border: "2px solid red",
              "& p": {
                opacity: "1",
              },
              ".notificationsTrash": {
                opacity: "0",
              },
            },
          }}
          onClick={() => setIsDeleteNotifications(true)}
        >
          <DeleteOutline
            sx={{ fontSize: "25px", transition: ".3s", opacity: "1" }}
            className="notificationsTrash"
          />
          <Typography
            position="absolute"
            sx={{ opacity: "0", transition: ".3s" }}
          >
            Delete all notifications
          </Typography>
        </Box>
      )}

      {notificationsState?.length > 0 &&
        _.uniqBy(notificationsState, "linkId")?.map((ntf) => {
          return (
            <Link
              to={
                ntf?.type === "message"
                  ? `/chat/${ntf?.linkId}`
                  : ntf?.type === "newPost" ||
                    ntf?.type === "like" ||
                    ntf?.type === "comment" ||
                    ntf?.type === "reply"
                  ? `/post/${ntf?.linkId}`
                  : ntf?.type === "badge"
                  ? `/profile/${user._id}/badges`
                  : ntf?.linkId
              }
              key={ntf?._id}
              className="opacityBox"
              onClick={() => setIsNotification(false)}
            >
              <Box display="flex" alignItems="center" gap="10px" my="5px">
                <Box position="relative">
                  {ntf.type !== "badge" && (
                    <UserImage
                      image={
                        ntf?.senderId === user._id
                          ? ntf?.receiverId?.picturePath
                          : ntf?.senderId?.picturePath
                      }
                    />
                  )}

                  {ntf?.type === "like" && (
                    <FavoriteOutlined
                      sx={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "0",
                        fontSize: "27px",
                        color: "red",
                      }}
                    />
                  )}

                  {ntf?.type === "message" && (
                    <MessageOutlined
                      sx={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "0",
                        fontSize: "27px",
                        color: "white",
                        bgcolor: "#a09265",
                        borderRadius: "50%",
                        p: "4px",
                      }}
                    />
                  )}

                  {ntf?.type === "newPost" && (
                    <Newspaper
                      sx={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "0",
                        fontSize: "27px",
                        color: "white",
                        bgcolor: "#0095fa",
                        borderRadius: "50%",
                        p: "4px",
                      }}
                    />
                  )}

                  {ntf?.type === "comment" && (
                    <Comment
                      sx={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "0",
                        fontSize: "27px",
                        color: "white",
                        bgcolor: "#7000ff",
                        borderRadius: "50%",
                        p: "4px",
                      }}
                    />
                  )}

                  {ntf?.type === "reply" && (
                    <Reply
                      sx={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "0",
                        fontSize: "27px",
                        color: "white",
                        bgcolor: "#0095fa",
                        borderRadius: "50%",
                        p: "4px",
                      }}
                    />
                  )}

                  {ntf?.type === "badge" && (
                    <Star
                      sx={{
                        fontSize: "50px",
                        background: "linear-gradient(to right, orange, yellow)",
                        borderRadius: "50%",
                        p: "4px",
                        ml: "10px",
                        boxShadow: "-1px 3px 0px 0 rgba(0, 0, 0, 0.1)",
                        color: "black",
                      }}
                    />
                  )}

                  {ntf?.type === "follow" && (
                    <Person
                      sx={{
                        position: "absolute",
                        bottom: "-4px",
                        right: "0",
                        fontSize: "27px",
                        color: "white",
                        bgcolor: "#6593a0",
                        borderRadius: "50%",
                        p: "4px",
                      }}
                    />
                  )}
                </Box>

                <Box>
                  <Typography
                    sx={{
                      maxWidth: "280px",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {ntf?.description}
                  </Typography>
                  <Typography color={medium}>
                    {timeAgo(ntf?.createdAt)}
                  </Typography>
                </Box>
              </Box>
            </Link>
          );
        })}
    </TasksComponent>
  );
};

export default NotificationData;
