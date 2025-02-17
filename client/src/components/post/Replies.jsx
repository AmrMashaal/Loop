/* eslint-disable react/prop-types */
import {
  DeleteOutlined,
  EditOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  MoreHoriz,
  VerifiedOutlined,
} from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { Link } from "react-router-dom";
import UserImage from "../UserImage";
import DOMPurify from "dompurify";
import { useState } from "react";
import DeleteComponent from "./DeleteComponent";
import EditThing from "./EditThing";
import socket from "../socket";
import { formatLikesCount } from "../../frequentFunctions";

const Replies = ({
  data,
  mode,
  timeAgo,
  user,
  testArabic,
  convertTextLink,
  setOpenPhotoImage,
  setIsOpenPhoto,
  setShowLikes,
  setCommentsState,
  setInputType,
  token,
  setReplyData,
  palette,
  isNonMobileScreens,
  postId,
  setShowLikesType,
  setShowLikesId,
}) => {
  const [replyText, setReplyText] = useState("");
  const [replyId, setReplyId] = useState(null);
  const [commentId, setCommentId] = useState(null);
  const [replyEditOpen, setReplyEditOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isDeleteReply, setIsDeleteReply] = useState(false);
  const [replyLikeLoading, setReplyLikeLoading] = useState({
    loading: false,
    replyId: null,
  });

  const handleDeleteReply = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/replies/${replyId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCommentsState((prev) => {
          return prev.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: comment?.replies?.filter((ele) => ele._id !== replyId),
                replyCount: comment?.replies?.replyCount - 1,
              };
            }
            return comment;
          });
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleLikeReply = async (replyId, comId) => {
    setReplyLikeLoading({ loading: true, replyId: replyId });

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/likes/${replyId}/${
          user._id
        }/likeReply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();

        setCommentsState((prev) => {
          return prev.map((comment) => {
            if (comment._id === comId) {
              return {
                ...comment,
                replies: comment?.replies?.map((ele) => {
                  if (ele._id === replyId) {
                    return {
                      ...ele,
                      isLiked: data.isLiked,
                      likesCount: data.reply.likesCount,
                    };
                  }
                  return ele;
                }),
              };
            }
            return comment;
          });
        });

        if (data.reply.user !== user._id && data.isLiked) {
          const response2 = await fetch(
            `${import.meta.env.VITE_API_URL}/notifications/${user._id}/${
              data.reply.user
            }`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: "like",
                description: `${user.firstName} liked your reply`,
                linkId: `${postId}-anotherId-${comId}`,
                receiverId: data.reply.user,
                senderId: user._id,
              }),
            }
          );

          const notification = await response2.json();

          socket.emit("notifications", {
            receiverId: data.reply.user,
            notification: notification,
          });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setReplyLikeLoading({ loading: false, replyId: null });
    }
  };

  return (
    <Box>
      {data?.replies?.length > 0 &&
        data?.replies?.map((reply) => {
          return (
            <Box key={reply?._id} display="flex" gap="6px" mt="10px">
              <Link
                to={`/profile/${reply?.user?._id}`}
                style={{ height: "fit-content" }}
              >
                <Box sx={{ cursor: "pointer" }}>
                  <UserImage image={reply?.user?.picturePath} size="45px" />
                </Box>
              </Link>

              <Box width="100%" mb="16px">
                <Box position="relative">
                  <Box
                    bgcolor={mode === "light" ? "#e7e7e7" : "#404040"}
                    p="10px"
                    borderRadius="0 .75rem .75rem .75rem 0"
                    borderLeft="2px solid gray"
                    border={reply?.highlight && "4px solid #2292e761"}
                  >
                    <Box display="flex" justifyContent="space-between">
                      <Box>
                        <Link
                          to={`/profile/${reply?.user?._id}`}
                          className="opacityBox"
                        >
                          <Box display="flex" alignItems="center" gap="5px">
                            <Typography
                              fontWeight="600"
                              sx={{ cursor: "pointer" }}
                              width="fit-content"
                            >
                              {reply?.user?.firstName} {reply?.user?.lastName}
                            </Typography>

                            {reply?.user?.verified && (
                              <VerifiedOutlined
                                sx={{
                                  fontSize: "20px",
                                  color: "#00D5FA",
                                }}
                              />
                            )}
                          </Box>
                        </Link>

                        <Typography
                          fontSize="11px"
                          mt="-1px"
                          mb="5px"
                          fontWeight="300"
                          color={mode === "light" ? "#6a6a6a" : "#b8b8b8"}
                          display="flex"
                          alignItems="center"
                          gap="2px"
                          sx={{ userSelect: "none" }}
                        >
                          <Box>{timeAgo(reply.createdAt)}</Box>

                          {reply?.edited && (
                            <Typography
                              fontSize="11px"
                              fontWeight="500"
                              color={mode === "light" ? "#6a6a6a" : "#b8b8b8"}
                            >
                              | Edited
                            </Typography>
                          )}
                        </Typography>
                      </Box>

                      {user._id === reply?.user?._id && (
                        <IconButton
                          onClick={() => {
                            setReplyEditOpen(true);
                            setReplyId(reply?._id);
                            setCommentId(reply?.comment);
                            setReplyText(reply?.reply);
                          }}
                        >
                          <MoreHoriz />
                        </IconButton>
                      )}
                    </Box>

                    <Typography
                      mt="2px"
                      ml="8px"
                      sx={{
                        wordBreak: "break-word",
                        direction: testArabic(reply.reply) ? "rtl" : "ltr",
                      }}
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(
                          convertTextLink(reply.reply),
                          {
                            ADD_ATTR: ["target", "rel"],
                          }
                        ),
                      }}
                    />
                  </Box>

                  {reply.picturePath && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/assets/${
                        reply.picturePath
                      }`}
                      alt={reply.picturePath}
                      style={{
                        width: "300px",
                        maxWidth: "100%",
                        maxHeight: "245px",
                        objectFit: "cover",
                        borderLeft: "2px solid gray",
                        background: "gray",
                        cursor: "pointer",
                        borderRadius: "0 0 10px 0",
                        minHeight: "201px",
                      }}
                      onClick={() => {
                        setOpenPhotoImage(reply.picturePath),
                          setIsOpenPhoto(true);
                      }}
                    />
                  )}

                  <Box
                    position="relative"
                    left="0"
                    display="flex"
                    alignItems="center"
                    gap="20px"
                  >
                    <Box display="flex" alignItems="center">
                      <IconButton
                        onClick={() => {
                          handleLikeReply(reply?._id, reply?.comment);
                        }}
                        disabled={
                          reply?._id === replyLikeLoading.replyId &&
                          replyLikeLoading.loading
                        }
                      >
                        {reply?.isLiked ? (
                          <FavoriteOutlined sx={{ color: "red" }} />
                        ) : (
                          <FavoriteBorderOutlined />
                        )}
                      </IconButton>

                      <Typography
                        sx={{
                          cursor: "pointer",
                          userSelect: "none",
                        }}
                        onClick={() => {
                          setShowLikes(true);
                          setShowLikesType("reply");
                          setShowLikesId(reply._id);
                        }}
                      >
                        {formatLikesCount(reply?.likesCount)}
                      </Typography>
                    </Box>

                    <Typography
                      color="#a9a4a4"
                      sx={{
                        cursor: "pointer",
                        userSelect: "none",
                        transition: ".3s",
                        ":hover": {
                          color: mode === "light" ? "#000" : "#fff",
                        },
                      }}
                      onClick={() => {
                        setInputType("reply");
                        setReplyData({
                          name: reply.user?.firstName,
                          id: reply?.comment,
                          userId: reply?.user,
                        });
                      }}
                    >
                      reply
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}

      {replyEditOpen && (
        <Box
          position="fixed"
          width="100%"
          height="100%"
          top="0"
          left="0"
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex="111"
        >
          <Box
            position="absolute"
            width="100%"
            height="100%"
            onClick={() => {
              setReplyData(false);
              setReplyEditOpen(false);
            }}
            bgcolor="#00000066"
          ></Box>
          <Box
            bgcolor={palette.neutral.light}
            p="10px 28px"
            width={isNonMobileScreens ? "500px" : "100%"}
            display="flex"
            alignItems="center"
            gap="14px"
            minHeight="100px"
            position="relative"
            sx={{
              maxWidth: "100%",
              zIndex: "1",
              maxHeight: isNonMobileScreens ? "700px" : "312px",
              overflow: "auto",
              borderRadius: isNonMobileScreens ? "0.75rem" : "0",
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap="10px"
              width="100%"
            >
              <IconButton
                sx={{
                  borderRadius: "8px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  width: "100%",
                }}
                onClick={() => {
                  setIsEdit(true);
                  setReplyEditOpen(false);
                }}
              >
                <EditOutlined sx={{ fontSize: "25px" }} />
                <Typography fontSize="16px">Edit The Comment</Typography>
              </IconButton>

              <IconButton
                sx={{
                  borderRadius: "8px",
                  display: "flex",
                  gap: "10px",
                  alignItems: "center",
                  width: "100%",
                }}
                onClick={() => {
                  setReplyEditOpen(false);
                  setIsDeleteReply(true);
                }}
              >
                <DeleteOutlined sx={{ fontSize: "25px" }} />
                <Typography fontSize="16px">Delete The Comment</Typography>
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {isEdit && (
        <EditThing
          setIsEdit={setIsEdit}
          text={replyText}
          thingId={replyId}
          setDataState={setCommentsState}
          type="reply"
        />
      )}

      {isDeleteReply && (
        <DeleteComponent
          type="reply"
          setIsDeleteReply={setIsDeleteReply}
          handleDeleteReply={handleDeleteReply}
        />
      )}
    </Box>
  );
};

export default Replies;
