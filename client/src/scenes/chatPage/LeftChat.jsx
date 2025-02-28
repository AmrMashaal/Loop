/* eslint-disable react/prop-types */
import { Box } from "@mui/system";
import { Divider, IconButton, InputBase, Typography } from "@mui/material";
import UserImage from "../../components/UserImage";
import { Link } from "react-router-dom";
import { Image, Search, VerifiedOutlined } from "@mui/icons-material";
import ChatHistorySkeleton from "../skeleton/ChatHistorySkeleton";
import { useEffect } from "react";
import { useSelector } from "react-redux";

const LeftChat = ({
  isNonMobileScreens,
  historyLoad,
  lastMessageData,
  setLastMessageData,
  user,
  setTitle,
  userId,
}) => {
  const token = useSelector((state) => state.token);

  const formatMessageTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } else if (isYesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-GB");
    }
  };

  useEffect(() => {
    if (userId) {
      if (userId !== user._id && lastMessageData.length !== 0) {
        const userLastMsg = lastMessageData.find(
          (ele) =>
            ele?.senderId?._id === userId || ele?.receiverId?._id === userId
        );

        setTitle(
          `Chat - ${
            userLastMsg?.senderId._id === userId
              ? `${userLastMsg?.senderId?.firstName} ${userLastMsg?.senderId?.lastName}`
              : `${userLastMsg?.receiverId?.firstName} ${userLastMsg?.receiverId?.lastName}`
          }`
        );
      } else if (userId === user._id && lastMessageData.length !== 0) {
        setTitle(`Chat - ${user.firstName} ${user?.lastName}`);
      }
    } else {
      setTitle("Chat");
    }
  }, [lastMessageData, userId]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const searchValue = e.target[1].value;

    if (searchValue.length !== 0) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/search/users/${searchValue}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        setLastMessageData(data.data);
      } catch (error) {
        if (import.meta.env.NODE_ENV === "development") {
          console.error(error);
        }
      }
    }
  };

  return (
    <Box flex={!isNonMobileScreens && 1}>
      <Box
        overflow="auto"
        width={isNonMobileScreens ? "350px" : "100%"}
        height="100vh"
        zIndex="11"
        whiteSpace="nowrap"
        boxShadow="8px 12px 11px 0 #0000000a"
        position="sticky"
        top="0"
        left="0"
        sx={{
          background: "#1a1c20",
        }}
      >
        <Box p="20px" color="white">
          <Typography
            fontSize="27px"
            color="#d7d7d7"
            sx={{ userSelect: "none" }}
          >
            CHATS
          </Typography>

          <form
            action=""
            style={{
              background: "#23242a",
              padding: "6px 4px 6px 40px",
              width: "100%",
              borderRadius: "50px",
              position: "relative",
              margin: "13px 0 40px",
            }}
            onSubmit={handleSearch}
          >
            <IconButton
              sx={{
                position: "absolute",
                top: "50%",
                left: "0",
                transform: "translateY(-50%)",
              }}
              type="submit"
            >
              <Search sx={{ color: "#65666c" }} />
            </IconButton>

            <InputBase
              type="text"
              fullWidth
              placeholder="Search user or chat"
              sx={{ color: "white" }}
            />
          </form>

          <Box>
            {lastMessageData?.map((ele, index) => {
              if (!ele?.senderId?.firstName && !ele?.firstName) return;

              return (
                <Link
                  key={index}
                  to={`/chat/${
                    ele?.senderId
                      ? user?._id === ele?.senderId?._id
                        ? ele?.receiverId?._id
                        : ele?.senderId?._id
                      : ele?._id
                  }`}
                  style={{ margin: "20px 0", display: "block" }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    className="opacityBox"
                  >
                    <Box display="flex" gap="10px">
                      <UserImage
                        image={
                          ele?.senderId
                            ? user?._id === ele?.senderId?._id
                              ? ele?.receiverId?.picturePath
                              : ele?.senderId?.picturePath
                            : ele?.picturePath
                        }
                        size="60"
                      />
                      <Box>
                        <Box
                          display="flex"
                          alignItems="center"
                          gap="6px"
                          maxWidth="160px"
                          mt="6px"
                        >
                          <Typography
                            fontSize="14px"
                            fontWeight="500"
                            textOverflow="ellipsis"
                            overflow="hidden"
                            whiteSpace="nowrap"
                          >
                            {ele?.senderId
                              ? user?._id === ele?.senderId?._id
                                ? ele?.receiverId?.firstName
                                : ele?.senderId?.firstName
                              : ele?.firstName}{" "}
                            {ele?.senderId
                              ? user?._id === ele?.senderId?._id
                                ? ele?.receiverId?.lastName
                                : ele?.senderId?.lastName
                              : ele?.lastName}
                          </Typography>

                          {ele?.senderId ? (
                            ele?.senderId?._id === user._id ? (
                              ele?.receiverId?.verified ? (
                                <VerifiedOutlined
                                  sx={{
                                    fontSize: "20px",
                                    color: "#00D5FA",
                                  }}
                                />
                              ) : undefined
                            ) : ele?.senderId?.verified ? (
                              <VerifiedOutlined
                                sx={{
                                  fontSize: "20px",
                                  color: "#00D5FA",
                                }}
                              />
                            ) : undefined
                          ) : ele?.verified ? (
                            <VerifiedOutlined
                              sx={{
                                fontSize: "20px",
                                color: "#00D5FA",
                              }}
                            />
                          ) : undefined}
                        </Box>

                        <Typography
                          color="#d7d7d7"
                          fontSize="12px"
                          fontWeight="400"
                          textOverflow="ellipsis"
                          overflow="hidden"
                          maxWidth="160px"
                          whiteSpace="nowrap"
                          display="flex"
                          gap="2px"
                          alignItems="center"
                        >
                          {ele?.senderId?._id === user._id ? (
                            <Typography>You:</Typography>
                          ) : undefined}{" "}
                          {ele?.senderId ? (
                            ele?.message ? (
                              ele?.message
                            ) : (
                              <Box display="flex" gap="4px">
                                <Typography fontWeight="300">Image</Typography>
                                <Image />
                              </Box>
                            )
                          ) : undefined}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography color="#d7d7d7" fontSize="12px">
                      {ele?.senderId && formatMessageTime(ele?.updatedAt)}
                    </Typography>
                  </Box>
                  {lastMessageData?.indexOf(ele) !==
                    lastMessageData?.length - 1 && (
                    <Divider sx={{ m: "10px 0" }} />
                  )}
                </Link>
              );
            })}

            {historyLoad && <ChatHistorySkeleton />}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LeftChat;
