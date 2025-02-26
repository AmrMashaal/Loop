/* eslint-disable react/prop-types */
import { IconButton, InputBase, Typography } from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import UserImage from "../UserImage";
import {
  VerifiedOutlined,
  MoreHoriz,
  EditOutlined,
  DeleteOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ImageOutlined,
  Send,
  PushPinOutlined,
  PushPin,
  Close,
  KeyboardReturn,
} from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import DOMPurify from "dompurify";
import EditThing from "./EditThing";
import DeleteComponent from "./DeleteComponent";
import FlexBetween from "../FlexBetween";
import OpenPhoto from "../OpenPhoto";
import Dropzone from "react-dropzone";
import { debounce } from "lodash";
import socket from "../../components/socket";
import Replies from "./Replies";
import WhoLiked from "./../WhoLiked";
import { formatLikesCount } from "../../frequentFunctions";

const Comments = ({
  _id,
  userId,
  comIdParam,
  countCheckLoading,
  countCheck,
  setCountCheck,
}) => {
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);

  const [commentInfo, setCommentInfo] = useState("");
  const [commentText, setCommentText] = useState("");
  const [image, setImage] = useState("");
  const [imageError, setImageError] = useState("");
  const [openPhotoImage, setOpenPhotoImage] = useState("");
  const [inputType, setInputType] = useState("comment");
  const [showLikesType, setShowLikesType] = useState("");
  const [replyData, setReplyData] = useState({ name: "", id: "", userId: "" });
  const [likeList, setLikeList] = useState([]);
  const [commentsState, setCommentsState] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [CommentUserId, setCommentUserId] = useState(null);
  const [commentId, setCommentId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPinnedComment, setIsPinnedComment] = useState(false);
  const [postLikeLoading, setPostLikeLoading] = useState(false);
  const [commentEditOpen, setCommentEditOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isImage, setIsImage] = useState(false);
  const [isDeleteComment, setIsDeleteComment] = useState(false);
  const [isOpenPhoto, setIsOpenPhoto] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [likesLoading, setLikesLoading] = useState(true);
  const [commentLikeLoading, setCommentLikeLoading] = useState({
    loading: true,
    commentId: null,
  });
  const [showLikesId, setShowLikesId] = useState(null);

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const { palette } = useTheme();

  const inputRef = useRef(null);

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (
      (commentInfo.trim().length !== 0 && !loading) ||
      (image.length !== 0 && !loading)
    ) {
      const formData = new FormData();

      formData.append("text", commentInfo);
      formData.append("user", user?._id);

      if (image) {
        formData.append("picture", image);
        formData.append("picturePath", image.name);
      }

      setLoading(true);

      try {
        const response = await fetch(`/api/comments/postComment/${_id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        setCommentsState((prev) => [data, ...prev]);
        setIsImage(false);
        setCommentInfo("");
        setImage("");

        if (userId && userId !== user?._id) {
          const response2 = await fetch(
            `/api/notifications/${user?._id}/${userId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: "comment",
                description: `${user?.firstName} commented on your post`,
                linkId: `${_id}-anotherId-${data?._id}`,
                receiverId: userId,
                senderId: user?._id,
              }),
            }
          );

          const notification = await response2.json();

          socket.emit("notifications", {
            receiverId: userId,
            notification: notification,
          });
        }
      } catch (error) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", error);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleComments = async (first = true) => {
    try {
      const response = await fetch(
        `/api/comments/${_id}/${comIdParam}?page=${pageNumber}&limit=5`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const comments = await response.json();

      if (response.ok) {
        if (first) {
          setCommentsState(comments);
        } else {
          setCommentsState((prev) => [...prev, ...comments]);
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

  const whoLikes = async (id, initial) => {
    setLikesLoading(true);

    try {
      const response = await fetch(
        `/api/likes/${id}/${showLikesType}?page=${likesPage}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (initial) {
        setLikeList(data);
      } else {
        setLikeList((prev) => {
          return { likes: [...prev.likes, ...data.likes], count: data.count };
        });
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLikesLoading(false);
    }
  };

  useEffect(() => {
    if (pageNumber === 1) {
      handleComments();
    } else {
      handleComments(false);
    }
  }, [pageNumber]);

  const escapeHtml = (str) => {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const convertTextLink = (text) => {
    const urlPattern = /(https?:\/\/[^\s]+)/g;

    text = escapeHtml(text).replace(urlPattern, (url) => {
      return `<a href="${url}" target="_blank" style="color: #2f9cd0; font-weight: 500; text-decoration: underline;">${url}</a>`;
    });

    return text;
  };

  const handleDeleteComment = async () => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const comment = await response.json();

      setCommentsState(
        commentsState.filter((newCom) => newCom._id !== comment._id)
      );
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handleLikeComment = async (commentId) => {
    setCommentLikeLoading({ loading: true, commentId });

    try {
      const response = await fetch(
        `/api/likes/${commentId}/${user?._id}/likeComment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const comment = await response.json();

      setCommentsState(
        commentsState.map((newCom) =>
          newCom._id === comment.comment._id
            ? {
                ...newCom,
                isLiked: comment.comment.isLiked,
                likesCount: comment.comment.likesCount,
              }
            : newCom
        )
      );

      if (
        comment.comment.user &&
        comment.comment.user !== user?._id &&
        comment.isLiked
      ) {
        const response2 = await fetch(
          `/api/notifications/${user?._id}/${comment.comment.user}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "like",
              description: `${user?.firstName} liked your comment`,
              linkId: `${comment.comment.postId}-anotherId-${comment.comment._id}`,
              receiverId: comment.comment.user,
              senderId: user?._id,
            }),
          }
        );

        const notification = await response2.json();

        socket.emit("notifications", {
          receiverId: comment.user,
          notification: notification,
        });
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setCommentLikeLoading({ loading: false, commentId });
    }
  };

  const handleLikePost = async () => {
    setPostLikeLoading(true);

    try {
      const response1 = await fetch(`/api/likes/${_id}/${user?._id}/like`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedPost = await response1.json();

      setCountCheck((prev) => {
        return { ...(prev || {}), isLiked: updatedPost.isLiked };
      });

      // -------------------Notificatons-------------------

      if (userId && userId !== user?._id && updatedPost.isLiked) {
        const response2 = await fetch(
          `/api/notifications/${user?._id}/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "like",
              description: `${user?.firstName} liked your post`,
              linkId: _id,
              receiverId: userId,
              senderId: user?._id,
            }),
          }
        );

        const notification = await response2.json();

        socket.emit("notifications", {
          receiverId: userId,
          notification: notification,
        });
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setPostLikeLoading(false);
    }
  };

  const testArabic = (description) => {
    const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return regexArabic.test(description);
  };

  const timeAgo = (postDate) => {
    const timeNow = new Date(); // get the current time
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

  const getMoreComments = () => {
    setPageNumber((prev) => prev + 1);
  };

  useEffect(() => {
    const commentsParent = document.getElementById("commentsParent");

    const scrollFunction = debounce(() => {
      if (
        commentsParent.scrollTop + commentsParent.clientHeight + 80 >=
        commentsParent.scrollHeight
      ) {
        getMoreComments();
      }
    }, 300);

    commentsParent.addEventListener("scroll", scrollFunction);

    return () => {
      commentsParent.removeEventListener("scroll", scrollFunction);
    };
  }, []);

  const handlePinComment = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/pin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const newComment = await response.json();

      if (newComment.pinned) {
        setCommentsState((prev) => [
          newComment,
          ...prev.filter((com) => com._id !== newComment._id),
        ]);
      } else {
        setCommentsState((prev) => [
          ...prev.filter((com) => com._id !== newComment._id),
          newComment,
        ]);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handlePlaceholder = () => {
    if (loading) return "Loading...";
    else if (commentsState?.length > 0 && inputType === "comment") {
      return "Write a comment";
    } else if (commentsState?.length === 0 && inputType === "comment") {
      return "Write the first comment";
    } else if (inputType === "reply") {
      return `Reply to ${replyData.name}`;
    }
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if ((commentInfo.trim().length !== 0 || image) && !loading) {
      const formData = new FormData();

      formData.append("reply", commentInfo);
      formData.append("comment", replyData.id);
      formData.append("user", replyData.name);
      formData.append("postId", _id);

      if (image) {
        formData.append("picture", image);
        formData.append("picturePath", image.name);
      }

      try {
        const response = await fetch(`/api/replies/${replyData.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await response.json();

        setCommentsState((prev) =>
          prev.map((com) =>
            com._id === replyData.id
              ? {
                  ...com,
                  replies: [data, ...(com?.replies || [])],
                }
              : com
          )
        );

        if (replyData.userId && replyData.userId !== user?._id) {
          const response2 = await fetch(
            `/api/notifications/${user?._id}/${replyData.userId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                type: "reply",
                description: `${user?.firstName} replied to your comment`,
                linkId: `${_id}-anotherId-${replyData?.id}`,
                receiverId: replyData.userId,
                senderId: user?._id,
              }),
            }
          );

          const notification = await response2.json();

          socket.emit("notifications", {
            receiverId: replyData.userId,
            notification: notification,
          });
        }
      } catch (error) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", error);
        }
      } finally {
        setLoading(false);
        setIsImage(false);
        setCommentInfo("");
        setImage("");
        setInputType("comment");
      }
    }
  };

  const getReplies = async (commentId, page = 1) => {
    setCommentsState((prev) =>
      prev.map((com) =>
        com._id === commentId
          ? {
              ...com,
              loading: true,
            }
          : com
      )
    );

    try {
      const response = await fetch(`/api/replies/${commentId}?page=${page}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const replies = await response.json();

      setCommentsState((prev) =>
        prev.map((com) =>
          com._id === commentId
            ? {
                ...com,
                replies: [...(com?.replies || []), ...replies],
                page: com.page + 1 || 2,
              }
            : com
        )
      );
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setCommentsState((prev) =>
        prev.map((com) =>
          com._id === commentId
            ? {
                ...com,
                loading: false,
              }
            : com
        )
      );
    }
  };

  useEffect(() => {
    if (inputType === "reply") {
      inputRef.current.children[0].focus();
    }
  }, [inputType]);

  useEffect(() => {
    if (!showLikes) {
      setLikeList({});
    }
  }, [showLikes]);

  return (
    <Box position="relative">
      <Box>
        {commentsState?.map((com, index) => {
          if (com?._id === undefined) {
            return (
              <Box
                key={index}
                p="10px"
                border="2px solid"
                textAlign="center"
                mt="25px"
              >
                The comment has been deleted DX
              </Box>
            );
          }
          return (
            <Box key={com?._id}>
              <Box key={com?._id} display="flex" gap="6px" mt="10px">
                <Link
                  to={`/profile/${com?.user?._id}`}
                  style={{ height: "fit-content" }}
                >
                  <Box sx={{ cursor: "pointer" }}>
                    <UserImage image={com?.user?.picturePath} size="45px" />
                  </Box>
                </Link>

                <Box width="100%" mb="16px">
                  <Box position="relative">
                    <Box
                      bgcolor={mode === "light" ? "#e7e7e7" : "#404040"}
                      p="10px"
                      borderRadius="0 .75rem .75rem .75rem 0"
                      borderLeft="2px solid gray"
                      border={com?.highlight && "4px solid #2292e761"}
                    >
                      <Box display="flex" justifyContent="space-between">
                        <Box>
                          <Link
                            to={`/profile/${com?.user?._id}`}
                            className="opacityBox"
                          >
                            <Box display="flex" alignItems="center" gap="5px">
                              <Typography
                                fontWeight="600"
                                sx={{ cursor: "pointer" }}
                                width="fit-content"
                              >
                                {com?.user?.firstName} {com?.user?.lastName}
                              </Typography>

                              {com?.user?.verified && (
                                <VerifiedOutlined
                                  sx={{ fontSize: "20px", color: "#00D5FA" }}
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
                            <Box>{timeAgo(com?.createdAt)}</Box>

                            {com?.edited && (
                              <Typography
                                fontSize="11px"
                                fontWeight="500"
                                color={mode === "light" ? "#6a6a6a" : "#b8b8b8"}
                              >
                                | Edited
                              </Typography>
                            )}

                            {com?.pinned && (
                              <Box display="flex" alignItems="center" gap="2px">
                                |{" "}
                                <Typography
                                  fontSize="11px"
                                  fontWeight="500"
                                  color={
                                    mode === "light" ? "#6a6a6a" : "#b8b8b8"
                                  }
                                >
                                  Pinned
                                </Typography>{" "}
                                <PushPinOutlined
                                  sx={{
                                    fontSize: "18px",
                                    position: "relative",
                                    top: "1px",
                                  }}
                                />
                              </Box>
                            )}
                          </Typography>
                        </Box>

                        {(user?._id === userId && (
                          <IconButton
                            onClick={() => {
                              setCommentId(com?._id),
                                setCommentText(com?.text),
                                setCommentEditOpen(true);
                              setCommentUserId(com?.user?._id);
                              setIsPinnedComment(com?.pinned);
                            }}
                          >
                            <MoreHoriz />
                          </IconButton>
                        )) ||
                          (user?._id === com?.user?._id && (
                            <IconButton
                              onClick={() => {
                                setCommentId(com?._id),
                                  setCommentText(com?.text),
                                  setCommentEditOpen(true);
                                setCommentUserId(com?.user?._id);
                              }}
                            >
                              <MoreHoriz />
                            </IconButton>
                          ))}
                      </Box>

                      <Typography
                        mt="2px"
                        ml="8px"
                        sx={{
                          wordBreak: "break-word",
                          direction: testArabic(com?.text) ? "rtl" : "ltr",
                        }}
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(
                            convertTextLink(com?.text),
                            {
                              ADD_ATTR: ["target", "rel"],
                            }
                          ),
                        }}
                      />
                    </Box>

                    {com?.picturePath && (
                      <img
                        src={com?.picturePath}
                        alt={com?.picturePath}
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
                          setOpenPhotoImage(com?.picturePath),
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
                            handleLikeComment(com?._id);
                          }}
                          disabled={
                            com?._id === commentLikeLoading.commentId &&
                            commentLikeLoading.loading
                          }
                        >
                          {com?.isLiked ? (
                            <FavoriteOutlined sx={{ color: "red" }} />
                          ) : (
                            <FavoriteBorderOutlined />
                          )}
                        </IconButton>

                        <Typography
                          sx={{ cursor: "pointer", userSelect: "none" }}
                          onClick={() => {
                            setShowLikes(true);
                            setShowLikesId(com?._id);
                            setShowLikesType("comment");
                          }}
                        >
                          {formatLikesCount(com?.likesCount)}
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
                            name: com?.user?.firstName,
                            id: com?._id,
                            userId: com?.user?._id,
                          });
                        }}
                      >
                        reply
                      </Typography>
                    </Box>

                    {com?.replies && (
                      <Replies
                        postId={_id}
                        data={com}
                        setCommentsState={setCommentsState}
                        commentsState={commentsState}
                        mode={mode}
                        token={token}
                        timeAgo={timeAgo}
                        user={user}
                        testArabic={testArabic}
                        convertTextLink={convertTextLink}
                        setOpenPhotoImage={setOpenPhotoImage}
                        setIsOpenPhoto={setIsOpenPhoto}
                        commentLikeLoading={commentLikeLoading}
                        setShowLikes={setShowLikes}
                        whoLikes={whoLikes}
                        setInputType={setInputType}
                        setReplyData={setReplyData}
                        palette={palette}
                        isNonMobileScreens={isNonMobileScreens}
                        setShowLikesType={setShowLikesType}
                        setShowLikesId={setShowLikesId}
                      />
                    )}

                    {com?.replyCount > 0 &&
                      com?.replyCount > (com?.replies?.length || 0) && (
                        <Box
                          display="flex"
                          alignItems="center"
                          color="#a9a4a4"
                          sx={{ userSelect: "none", cursor: "pointer" }}
                          onClick={() => {
                            if (!com?.loading || false) {
                              getReplies(com?._id, com?.page);
                            }
                          }}
                        >
                          <KeyboardReturn sx={{ transform: "scaleX(-1)" }} />
                          <Typography ml="10px" fontSize="12px">
                            View{" "}
                            {!(com?.replyCount > com?.replies?.length) &&
                              com?.replyCount !== 1 &&
                              "All"}{" "}
                            {!(com?.replyCount > com?.replies?.length) &&
                              com?.replyCount}{" "}
                            {com?.replyCount > com?.replies?.length && "More"}{" "}
                            {com?.replyCount === 1 ? "Reply" : "Replies"}
                          </Typography>

                          {com?.loading && (
                            <Box
                              className="loadingAnimation"
                              width="20px"
                              height="20px"
                              ml="8px"
                            ></Box>
                          )}
                        </Box>
                      )}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}

        {showLikes && (
          <WhoLiked
            likeList={likeList}
            likesLoading={likesLoading}
            setLikeList={setLikeList}
            setShowLikes={setShowLikes}
            showLikes={showLikes}
            WhoLikes={whoLikes}
            page={likesPage}
            setPage={setLikesPage}
            postId={_id}
            elementId={showLikesId}
          />
        )}

        {commentEditOpen && (
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
                setCommentEditOpen(false);
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
                {user?._id === CommentUserId && (
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
                      setCommentEditOpen(false);
                    }}
                  >
                    <EditOutlined sx={{ fontSize: "25px" }} />
                    <Typography fontSize="16px">Edit The Comment</Typography>
                  </IconButton>
                )}

                {user?._id === userId && (
                  <IconButton
                    sx={{
                      borderRadius: "8px",
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                      width: "100%",
                    }}
                    onClick={() => {
                      setCommentEditOpen(false);
                      handlePinComment(commentId);
                      setIsPinnedComment();
                    }}
                  >
                    {isPinnedComment ? (
                      <Box position="relative">
                        <Box
                          sx={{
                            width: "35px",
                            height: "2px",
                            backgroundColor: "#FF0000",
                            position: "absolute",
                            top: "45%",
                            left: "50%",
                            transform: "translate(-50%, -50%) rotate(-45deg)",
                          }}
                        />

                        <PushPin
                          sx={{
                            fontSize: "25px",
                          }}
                        />
                      </Box>
                    ) : (
                      <PushPin sx={{ fontSize: "25px" }} />
                    )}
                    <Typography fontSize="16px">
                      {isPinnedComment
                        ? "Unpin The Comment"
                        : "Pin The Comment"}
                    </Typography>
                  </IconButton>
                )}

                <IconButton
                  sx={{
                    borderRadius: "8px",
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    width: "100%",
                  }}
                  onClick={() => {
                    setCommentEditOpen(false);
                    setIsDeleteComment(true);
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
            text={commentText}
            thingId={commentId}
            setDataState={setCommentsState}
          />
        )}

        {isDeleteComment && (
          <DeleteComponent
            type="comment"
            setIsDeleteComment={setIsDeleteComment}
            handleDeleteComment={handleDeleteComment}
          />
        )}

        {isOpenPhoto && (
          <OpenPhoto photo={openPhotoImage} setIsImagOpen={setIsOpenPhoto} />
        )}

        {loading && (
          <Box
            className="loadingAnimation"
            width="30px"
            height="30px"
            m="10px auto"
          ></Box>
        )}
      </Box>

      <Box
        position="sticky"
        bottom="-12px"
        width="100%"
        bgcolor={palette.neutral.light}
      >
        <Box my="4px">
          <IconButton
            sx={{ borderRadius: "3px" }}
            onClick={handleLikePost}
            disabled={postLikeLoading || countCheckLoading}
          >
            <Box display="flex" alignItems="center" gap="5px">
              {countCheck?.isLiked ? (
                <FavoriteOutlined style={{ fontSize: "23px", color: "red" }} />
              ) : (
                <FavoriteBorderOutlined style={{ fontSize: "23px" }} />
              )}
              <Typography fontWeight="500">
                {countCheckLoading ? "Loading..." : "Like"}
              </Typography>
            </Box>
          </IconButton>
        </Box>

        <form
          action=""
          onSubmit={(e) => {
            if (inputType === "comment") handleSubmitComment(e);
            else if (inputType === "reply") handleSubmitReply(e);
          }}
          style={{ position: "relative" }}
        >
          <InputBase
            type="text"
            fullWidth
            multiline
            maxRows={10}
            placeholder={handlePlaceholder()}
            value={commentInfo}
            onChange={(e) => {
              if (e.target.value.length <= 300) setCommentInfo(e.target.value);
              else if (e.target.value.length > 300)
                setCommentInfo(e.target.value.slice(0, 300));
            }}
            sx={{
              border: "1px solid #7a7a7a",
              borderRadius: !commentInfo && "50px",
              p:
                inputType === "comment"
                  ? "7px 36px 7px 18px"
                  : "7px 66px 7px 18px",
              direction: testArabic(commentInfo) && "rtl",
            }}
            ref={inputRef}
          />

          {inputType === "reply" && (
            <IconButton
              sx={{
                position: "absolute",
                right: "38px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
              onClick={() => {
                setInputType("comment");
                setReplyData({ name: "", id: "", userId: "" });
              }}
            >
              <Close />
            </IconButton>
          )}

          <IconButton
            sx={{
              position: "absolute",
              right: "0",
              top: "50%",
              transform: "translateY(-50%)",
            }}
            type="submit"
          >
            <Send />
          </IconButton>
        </form>

        {isImage && (
          <Box
            border={`2px solid ${palette.neutral.medium}`}
            padding="1rem"
            mt="15px"
            sx={{
              gridColumn: "span 4",
              borderRadius: "4px",
              userSelect: "none",
            }}
          >
            <Dropzone
              accept=".jpg,.jpeg,.png,.webp"
              multiple={false}
              onDrop={(acceptedFiles) => {
                const file = acceptedFiles[0];
                const fileExtension = file.name.split(".").pop().toLowerCase();
                if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
                  setImage(file);
                  setImageError(null);
                } else if (
                  !["jpg", "jpeg", "png", "webp"].includes(fileExtension)
                ) {
                  setImageError("This file is not supported");
                }
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <Box
                  {...getRootProps()}
                  border={`2px dashed ${palette.primary.main}`}
                  padding="1rem"
                  sx={{ cursor: "pointer" }}
                >
                  <input {...getInputProps()} />
                  {!image ? (
                    <FlexBetween>
                      <p>Add Picture Here</p>
                      <IconButton>
                        <EditOutlined />
                      </IconButton>
                    </FlexBetween>
                  ) : (
                    <FlexBetween>
                      <Typography>
                        {image.name.length > 20
                          ? `${image.name.slice(0, 20) + "..."}`
                          : image.name}
                      </Typography>

                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setImageError(null);
                          setImage(null);
                        }}
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </FlexBetween>
                  )}
                </Box>
              )}
            </Dropzone>
          </Box>
        )}

        {imageError && isImage && (
          <Box color="red" mt="8px">
            {imageError}
          </Box>
        )}

        <FlexBetween
          gap="5px"
          width="fit-content"
          p="3px"
          mt="4px"
          sx={{
            cursor: "pointer",
            userSelect: "none",
            borderRadius: "5px",
            transition: ".3s",
            ":hover": {
              bgcolor: "#54545433",
            },
          }}
          onClick={() => {
            setIsImage(!isImage);
            setImageError(false);
          }}
        >
          <ImageOutlined />
          <Typography>Image</Typography>
        </FlexBetween>
      </Box>
    </Box>
  );
};

export default Comments;
