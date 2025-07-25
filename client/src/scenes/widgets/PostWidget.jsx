/* eslint-disable react/prop-types */
import { Button, IconButton, Typography } from "@mui/material";
import {
  VerifiedOutlined,
  MoreHoriz,
  PushPinOutlined,
  Public,
  Lock,
  People,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { Box, useMediaQuery, useTheme } from "@mui/system";
import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import UserImage from "../../components/UserImage";
import DeleteComponent from "../../components/post/DeleteComponent";
import UserDot from "../../components/post/UserDot";
import LikePost from "../../components/post/LikePost";
import WhoLiked from "../../components/WhoLiked";
import PostImg from "../../components/post/PostImg";
import PostEdited from "../../components/post/PostEdited";
import PostSkeleton from "../skeleton/PostSkeleton";
import socket from "../../components/socket";
import DOMPurify from "dompurify";
import { posts, setIsOverFlow, setPosts } from "../../App";
import ChangePrivacy from "../../components/post/ChangePrivacy";
import ShareComponent from "../../components/post/ShareComponent";
import { formatTextForDisplay } from "../../frequentFunctions";
import PostText from "../../components/post/PostText";

const PostWidget = ({
  setPostClickData,
  isPostClicked,
  setIsPostClicked,
  postLoading,
  setPostClickType,
  followSuggestions,
  setFollowSuggestions,
  pageNumber,
}) => {
  const [showLikes, setShowLikes] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [repostLoading, setRepostLoading] = useState(false);
  const [changePrivacyLoading, setChangePrivacyLoading] = useState(false);
  const [isChangePrivacy, setIsChangePrivacy] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [isShare, setIsShare] = useState(false);
  const [isDots, setIsDots] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [postWhoDeleted, setPostWhoDeleted] = useState(null);
  const [followLoadingId, setFollowLoadingId] = useState(null);
  const [postInfo, setPostInfo] = useState({ postId: null, userId: null });
  const [likeList, setLikeList] = useState({});
  const [clickLikeLoading, setClickLikeLoading] = useState({
    postId: null,
    loading: false,
  });
  const [page, setPage] = useState(1);

  const { palette } = useTheme();
  const medium = palette.neutral.medium;

  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);

  const location = useLocation();

  const { userId } = useParams();

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  useEffect(() => {
    if (showLikes || isPostClicked || isDelete || isDots || isEdit) {
      setIsOverFlow(true);
    } else {
      setIsOverFlow(false);
    }
  }, [showLikes, isPostClicked, isDelete, isDots, isEdit]);

  const howIsText = (text, img, txtad) => {
    if (!img && text?.length < 50 && txtad?.type !== "color") return "24px";
    else if (txtad?.value === "quotation" && text?.length < 100) return "24px";
    else if (
      txtad?.type === "color" &&
      text?.length < 100 &&
      isNonMobileScreens
    )
      return "26px";
    else if (
      txtad?.type === "color" &&
      text?.length < 100 &&
      !isNonMobileScreens
    )
      return "19px";
    else if (
      txtad?.type === "color" &&
      text?.length > 100 &&
      isNonMobileScreens
    )
      return "19px";
    else if (
      txtad?.type === "color" &&
      text?.length > 100 &&
      !isNonMobileScreens
    )
      return "15px";
    else return "15px";
  };

  const whoLikesPost = async (postId, initial = false) => {
    setLikesLoading(true);

    try {
      if (typeof postId === "object") {
        const response = await fetch(
          `/api/likes/${postId._id}/repost?page=${page}`,
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
      } else {
        const response = await fetch(`/api/likes/${postId}/post?page=${page}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (initial) {
          setLikeList(data);
        } else {
          setLikeList((prev) => {
            return { likes: [...prev.likes, ...data.likes], count: data.count };
          });
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLikesLoading(false);
    }
  };

  const handleLike = async (ele) => {
    const postId = ele._id;

    setClickLikeLoading({ postId, loading: true });

    try {
      const response1 = await fetch(
        `/api/likes/${postId}/${user._id}/${
          typeof ele.postId !== "object" ? "like" : "likeRepost"
        }`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedPost = await response1.json();

      if (response1.ok) {
        setPosts(
          posts.map((ele) =>
            ele._id !== postId
              ? ele
              : {
                  ...ele,
                  isLiked: updatedPost.isLiked,
                  likesCount: updatedPost.post.likesCount,
                }
          )
        );
      }

      if (
        ele?.userId !== user._id &&
        ele?.userId?._id !== user._id &&
        updatedPost.isLiked
      ) {
        const response2 = await fetch(
          `/api/notifications/${user._id}/${ele?.userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "like",
              description: `${user.firstName} liked your post`,
              linkId: postId,
              receiverId: ele?.userId,
              senderId: user._id,
            }),
          }
        );

        const notification = await response2.json();

        if (import.meta.env.VITE_NODE_ENV !== "production") {
          socket.emit("notifications", {
            receiverId: ele?.userId,
            notification: notification,
          });
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setClickLikeLoading({ postId: null, loading: false });
    }
  };

  const handleDeletePost = async () => {
    try {
      await fetch(`/api/posts/${postWhoDeleted}/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setPosts(posts.filter((ele) => ele._id !== postWhoDeleted));
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handleEditPost = async (e, editText, description) => {
    e.preventDefault();

    if (editText !== description && editText.trim().length > 0) {
      try {
        const response = await fetch(`/api/posts/${postInfo.postId}/edit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ description: editText }),
        });

        const data = await response.json();

        setPosts([data, ...posts.filter((ele) => ele._id !== data._id)]);
      } catch (error) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", error);
        }
      }
    }
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

  const testArabic = (description) => {
    const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return regexArabic.test(description);
  };

  useEffect(() => {
    if (!showLikes) {
      setLikeList({});
    }
  }, [showLikes]);

  const handleChangePrivacy = async (postPrivacy) => {
    setChangePrivacyLoading(true);
    try {
      const response = await fetch(
        `/api/posts/${postInfo.postId}/changePrivacy`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ privacy: postPrivacy }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setPosts((prev) => {
          return prev.map((ele) =>
            ele._id === data.postId ? { ...ele, privacy: data.privacy } : ele
          );
        });
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error(error);
      }
    } finally {
      setIsChangePrivacy(false);
      setChangePrivacyLoading(false);
    }
  };

  const handleRepost = async (e, privacy, description) => {
    setRepostLoading(true);
    e.preventDefault();

    try {
      const response = await fetch(`/api/reposts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ privacy, postId: postInfo.postId, description }),
      });

      const data = await response.json();

      if (userId === user._id || !userId) {
        setPosts([data, ...posts]);
      }
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error(error);
      }
    } finally {
      setIsShare(false);
      setRepostLoading(false);
    }
  };

  const handleFollow = async (followedUser) => {
    setFollowLoadingId(followedUser);

    try {
      const response = await fetch(`/api/follow/${followedUser}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setFollowSuggestions((prev) => {
        return prev.map((ele) => {
          return ele._id === followedUser
            ? { ...ele, isFollowed: Boolean(data) }
            : ele;
        });
      });
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setFollowLoadingId(null);
    }
  };

  // eslint-disable-next-line react/prop-types
  return (
    <Box>
      {posts && (
        <>
          {posts?.map((ele, index) => {
            const textAddition = ele?.textAddition
              ? JSON.parse(ele?.textAddition)
              : "";

            return (
              <Box key={index}>
                <WidgetWrapper mb="10px" isPost={true}>
                  <Box p="14px 14px 2px">
                    <FlexBetween>
                      <Link to={`/profile/${ele?.userId?._id}`}>
                        <FlexBetween gap="10px">
                          <Box sx={{ cursor: "pointer" }}>
                            <UserImage
                              image={ele?.userId?.picturePath}
                              size="40px"
                            />
                          </Box>

                          <Box>
                            <Box
                              sx={{ cursor: "pointer" }}
                              display="flex"
                              alignItems="center"
                              gap="4px"
                            >
                              <Typography
                                fontSize="14px"
                                className="opacityBox"
                              >
                                {ele?.userId?.firstName} {ele?.userId?.lastName}
                              </Typography>

                              {ele?.userId?.verified && (
                                <VerifiedOutlined sx={{ color: "#15a1ed" }} />
                              )}
                            </Box>

                            <Typography
                              fontSize="11px"
                              color={medium}
                              display="flex"
                              alignItems="center"
                              gap="3px"
                              sx={{ userSelect: "none" }}
                            >
                              {timeAgo(ele?.createdAt)}{" "}
                              {ele?.privacy === "public" ? (
                                <Public sx={{ fontSize: "15px" }} />
                              ) : ele?.privacy === "friends" ? (
                                <People sx={{ fontSize: "15px" }} />
                              ) : (
                                <Lock sx={{ fontSize: "15px" }} />
                              )}
                              {ele?.edited && (
                                <Typography fontWeight="500" fontSize="11px">
                                  | Edited
                                </Typography>
                              )}
                              {ele?.pinned &&
                                location.pathname.split("/")[1] ===
                                  "profile" && (
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    gap="2px"
                                    fontWeight="500"
                                    fontSize="11px"
                                  >
                                    | Pinned
                                    <PushPinOutlined
                                      sx={{ fontSize: "14px" }}
                                    />
                                  </Box>
                                )}
                            </Typography>
                          </Box>
                        </FlexBetween>
                      </Link>

                      {typeof ele.postId === "object" &&
                      ele?.userId?._id === user._id ? (
                        <IconButton
                          onClick={() => {
                            setIsDots(true),
                              setPostInfo({
                                postId: ele._id,
                                userId: ele?.userId?._id,
                              });
                          }}
                        >
                          <MoreHoriz />
                        </IconButton>
                      ) : ele?.userId?._id === user._id ? (
                        <IconButton
                          onClick={() => {
                            setIsDots(true),
                              setPostInfo({
                                postId: ele._id,
                                userId: ele?.userId?._id,
                              });
                          }}
                        >
                          <MoreHoriz />
                        </IconButton>
                      ) : undefined}
                    </FlexBetween>

                    <Box
                      p={textAddition?.value === "quotation" && "15px"}
                      m={
                        textAddition?.value === "quotation"
                          ? "15px 0 8px"
                          : ele?.picturePath && ele?.description
                          ? "10px 0 0"
                          : ele?.description && !ele?.picturePath
                          ? "14px 00 0"
                          : undefined
                      }
                      textAlign={textAddition.type === "color" && "center"}
                      sx={{
                        p: textAddition.type === "color" && "160px 25px",
                        background:
                          textAddition.type === "color" && textAddition.value,
                        cursor: textAddition.type === "color" && "pointer",
                        color:
                          textAddition.type === "color" &&
                          textAddition.value !==
                            "linear-gradient(to right, #89003054, #007a3342, #00000000)" &&
                          "white",
                        textDecoration:
                          textAddition?.value === "strikethrough" &&
                          "line-through",
                        fontStyle: textAddition?.value === "italic" && "italic",
                      }}
                      onClick={() => {
                        if (textAddition?.type === "color") {
                          setIsPostClicked(true),
                            setPostClickType("post"),
                            setPostClickData({
                              firstName: ele?.userId?.firstName,
                              lastName: ele?.userId?.lastName,
                              picturePath: ele?.picturePath,
                              userPicturePath: ele?.userId?.picturePath,
                              description: ele?.description,
                              _id: ele?._id,
                              userId: ele?.userId?._id,
                              verified: ele?.userId?.verified,
                            });
                        }
                      }}
                    >
                      <PostText
                        key={ele?._id}
                        ele={ele}
                        textAddition={textAddition}
                        howIsText={howIsText}
                        mode={mode}
                        testArabic={testArabic}
                      />
                    </Box>
                  </Box>

                  {ele?.picturePath?.length > 0 && (
                    <PostImg
                      setIsPostClicked={setIsPostClicked}
                      setPostClickData={setPostClickData}
                      setPostClickType={setPostClickType}
                      ele={ele}
                    />
                  )}

                  {typeof ele.postId === "object" && (
                    <Box p="10px">
                      {ele?.postId?.picturePath?.length > 0 && (
                        <PostImg
                          setIsPostClicked={setIsPostClicked}
                          setPostClickType={setPostClickType}
                          setPostClickData={setPostClickData}
                          ele={ele.postId}
                          isRepost={true}
                        />
                      )}

                      <Box
                        mt={ele?.postId?.picturePath ? "0" : "13px"}
                        border="1px solid #4a366a"
                        p="10px"
                        sx={{
                          cursor: ele?.postId !== null ? "pointer" : undefined,
                        }}
                        onClick={() => {
                          if (ele?.postId !== null) {
                            setIsPostClicked(true);
                            setPostClickType("post");
                            setPostClickData({
                              firstName: ele?.postId?.userId?.firstName,
                              lastName: ele?.postId?.userId?.lastName,
                              picturePath: ele?.postId?.picturePath,
                              userPicturePath: ele?.postId?.userId?.picturePath,
                              description: ele?.postId?.description,
                              _id: ele?.postId?._id,
                              userId: ele?.postId?.userId?._id,
                              verified: ele?.postId?.userId?.verified,
                            });
                          }
                        }}
                      >
                        {ele?.postId !== null ? (
                          <Link
                            to={`/profile/${ele?.postId?.userId?._id}`}
                            style={{ width: "fit-content", display: "block" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Box gap="10px" display="flex" alignItems="center">
                              <Box sx={{ cursor: "pointer" }}>
                                <UserImage
                                  image={ele?.postId?.userId?.picturePath}
                                  size="40px"
                                />
                              </Box>

                              <Box>
                                <Box
                                  sx={{ cursor: "pointer" }}
                                  display="flex"
                                  alignItems="center"
                                  gap="4px"
                                >
                                  <Typography
                                    fontSize="14px"
                                    className="opacityBox"
                                  >
                                    {ele?.postId?.userId?.firstName}{" "}
                                    {ele?.postId?.userId?.lastName}
                                  </Typography>

                                  {ele?.postId?.userId?.verified && (
                                    <VerifiedOutlined
                                      sx={{ color: "#15a1ed" }}
                                    />
                                  )}
                                </Box>

                                <Typography
                                  fontSize="11px"
                                  color={medium}
                                  display="flex"
                                  alignItems="center"
                                  gap="3px"
                                  sx={{ userSelect: "none" }}
                                >
                                  {timeAgo(ele?.postId?.createdAt)}{" "}
                                  {ele?.postId?.privacy === "public" ? (
                                    <Public sx={{ fontSize: "15px" }} />
                                  ) : ele?.postId?.privacy === "friends" ? (
                                    <People sx={{ fontSize: "15px" }} />
                                  ) : (
                                    <Lock sx={{ fontSize: "15px" }} />
                                  )}
                                  {ele?.edited && (
                                    <Typography
                                      fontWeight="500"
                                      fontSize="11px"
                                    >
                                      | Edited
                                    </Typography>
                                  )}
                                </Typography>
                              </Box>
                            </Box>
                          </Link>
                        ) : (
                          <Box display="flex" alignItems="center" gap="10px">
                            <Lock sx={{ fontSize: "22px" }} />

                            <Box>
                              <Typography
                                fontSize={isNonMobileScreens ? "15px" : "12px"}
                                fontWeight="500"
                              >
                                This content isn&apos;t available right now
                              </Typography>

                              <Typography
                                fontSize={isNonMobileScreens ? "12px" : "10px"}
                                color={palette.text.secondary}
                              >
                                When this happens, it&apos;s usually because the
                                owner only shared it with a small group of
                                people, changed who can see it or it&apos;s been
                                deleted.
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {ele?.postId?.description && (
                          <>
                            <Typography
                              mt="10px"
                              fontSize="15px"
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  formatTextForDisplay(
                                    ele?.postId?.description?.length > 400 &&
                                      !ele?.postId?.picturePath
                                      ? ele?.postId?.description?.slice(0, 400)
                                      : ele?.postId?.description?.length >
                                          400 && ele?.picturePath
                                      ? ele?.postId?.description?.slice(0, 179)
                                      : ele?.postId?.description
                                  ),
                                  {
                                    ADD_ATTR: ["target", "rel"],
                                  }
                                ),
                              }}
                            />
                          </>
                        )}
                      </Box>
                    </Box>
                  )}

                  <LikePost
                    ele={ele}
                    user={user}
                    setShowLikes={setShowLikes}
                    handleLike={handleLike}
                    setIsPostClicked={setIsPostClicked}
                    setPostClickData={setPostClickData}
                    loading={clickLikeLoading}
                    setPostInfo={setPostInfo}
                    palette={palette}
                    setIsShare={setIsShare}
                    setPostClickType={setPostClickType}
                  />
                </WidgetWrapper>

                {(posts.length > 4
                  ? index === 3 || index === 30 || index === 80
                  : index === 0) &&
                  location.pathname === "/" &&
                  followSuggestions?.length !== 0 && (
                    <Box
                      key={index + 123}
                      my="20px"
                      position="relative"
                      height="252px"
                    >
                      <Typography
                        textAlign="left"
                        fontSize="18px"
                        fontWeight="500"
                        color={medium}
                        mb="10px"
                        mt="20px"
                        sx={{ userSelect: "none" }}
                      >
                        suggested for you
                      </Typography>

                      <ArrowForward
                        sx={{
                          borderRadius: "50%",
                          bgcolor: palette.neutral.light,
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          p: "5px",
                          top: "50%",
                          right: "-5px",
                          position: "absolute",
                          transform: "translateY(-50%)",
                          zIndex: "1",
                          cursor: "pointer",
                          border: `1px solid ${palette.neutral.main}`,
                          transition: ".3s",
                          ":hover": {
                            opacity: ".8",
                          },
                        }}
                        onClick={() => {
                          const scrollableDiv = document.querySelector(
                            ".scrollable" + index
                          );

                          scrollableDiv.scrollBy({
                            top: 0,
                            left: scrollableDiv.clientWidth,
                            behavior: "smooth",
                          });
                        }}
                      />

                      <Box
                        display="flex"
                        gap="10px"
                        overflow="auto"
                        maxWidth="100%"
                        position="absolute"
                        sx={{ scrollbarWidth: "none" }}
                        className={`scrollable${index}`}
                      >
                        {followSuggestions?.map((fol, followIndex) => {
                          return (
                            <Link
                              to={`/profile/${fol?._id}`}
                              key={followIndex}
                              target="_blank"
                            >
                              <Box
                                display="flex"
                                gap="12px"
                                alignItems="center"
                                justifyContent="center"
                                flexDirection="column"
                                width="150px"
                                p="15px 10px"
                                borderRadius="9px"
                                bgcolor={palette.background.alt}
                              >
                                <UserImage image={fol.picturePath} size="80" />

                                <Box textAlign="center">
                                  <Box
                                    display={fol.verified ? "flex" : "unset"}
                                    gap="2px"
                                    alignItems="center"
                                  >
                                    <Typography
                                      maxWidth="100px"
                                      fontSize="14px"
                                      overflow="hidden"
                                      textOverflow="ellipsis"
                                      whiteSpace="nowrap"
                                      textAlign="center"
                                    >
                                      {fol.firstName} {fol.lastName}
                                    </Typography>

                                    {fol.verified && (
                                      <VerifiedOutlined
                                        sx={{ color: "#15a1ed" }}
                                      />
                                    )}
                                  </Box>

                                  <Typography
                                    fontSize="12px"
                                    color={medium}
                                    overflow="hidden"
                                    textOverflow="ellipsis"
                                    whiteSpace="nowrap"
                                    maxWidth="100px"
                                    textAlign="center"
                                  >
                                    @{fol.username}
                                  </Typography>
                                </Box>

                                <Button
                                  fullWidth
                                  sx={{
                                    backgroundColor: fol?.isFollowed
                                      ? palette.neutral.light
                                      : palette.primary.dark,
                                    color: fol?.isFollowed
                                      ? palette.neutral.main
                                      : "white",
                                    transition: ".3s",
                                    "&:hover": {
                                      opacity: "0.8",
                                      backgroundColor: fol?.isFollowed
                                        ? "white"
                                        : palette.primary.dark,
                                    },
                                  }}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    handleFollow(fol._id);
                                  }}
                                  disabled={followLoadingId === fol._id}
                                >
                                  {followLoadingId === fol._id
                                    ? "Loading..."
                                    : fol?.isFollowed
                                    ? "Followed"
                                    : "Follow"}
                                </Button>
                              </Box>
                            </Link>
                          );
                        })}
                      </Box>

                      <ArrowBack
                        sx={{
                          borderRadius: "50%",
                          bgcolor: palette.neutral.light,
                          width: "30px",
                          height: "30px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "600",
                          p: "5px",
                          top: "50%",
                          left: "-5px",
                          position: "absolute",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                          zIndex: "1",
                          border: `1px solid ${palette.neutral.main}`,
                          transition: ".3s",
                          ":hover": {
                            opacity: ".8",
                          },
                        }}
                        onClick={() => {
                          const scrollableDiv = document.querySelector(
                            ".scrollable" + index
                          );

                          scrollableDiv.scrollBy({
                            top: 0,
                            left: -scrollableDiv.clientWidth,
                            behavior: "smooth",
                          });
                        }}
                      />
                    </Box>
                  )}
              </Box>
            );
          })}

          {isDots && (
            <Box
              position="fixed"
              width="100%"
              height="100%"
              top="0"
              left="0"
              display="flex"
              alignItems="center"
              justifyContent="center"
              zIndex="11111"
            >
              <Box
                position="absolute"
                width="100%"
                height="100%"
                onClick={() => {
                  setIsDots(false);
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
                <UserDot
                  setPostWhoDeleted={setPostWhoDeleted}
                  postInfo={postInfo}
                  setIsDelete={setIsDelete}
                  setIsDots={setIsDots}
                  setIsEdit={setIsEdit}
                  setIsChangePrivacy={setIsChangePrivacy}
                />
              </Box>
            </Box>
          )}
          {isEdit && (
            <PostEdited
              setIsEdit={setIsEdit}
              image={
                posts.filter((post) => post._id === postInfo.postId)[0]
                  ?.picturePath
                  ? posts.filter((post) => post._id === postInfo.postId)[0]
                      ?.picturePath
                  : null
              }
              description={
                posts.filter((post) => post._id === postInfo.postId)[0]
                  ?.description
              }
              handleEditPost={handleEditPost}
            />
          )}

          {showLikes && (
            <WhoLiked
              likesLoading={likesLoading}
              likeList={likeList}
              showLikes={showLikes}
              setShowLikes={setShowLikes}
              setLikeList={setLikeList}
              WhoLikes={whoLikesPost}
              page={page}
              setPage={setPage}
              elementId={postInfo.postId}
            />
          )}

          {isDelete && (
            <DeleteComponent
              setIsDelete={setIsDelete}
              handleDeletePost={handleDeletePost}
              type="post"
            />
          )}

          {isShare && (
            <ShareComponent
              isShare={isShare}
              setIsShare={setIsShare}
              postInfo={postInfo}
              setPostInfo={setPostInfo}
              user={user}
              neutralColor={palette.neutral.light}
              handleSubmit={handleRepost}
              repostLoading={repostLoading}
              palette={palette}
            />
          )}
        </>
      )}

      {isChangePrivacy && (
        <ChangePrivacy
          palette={palette}
          setIsChangePrivacy={setIsChangePrivacy}
          isChangePrivacy={isChangePrivacy}
          handleChangePrivacy={handleChangePrivacy}
          changePrivacyLoading={changePrivacyLoading}
        />
      )}

      {postLoading && pageNumber === 1 && <PostSkeleton />}

      {postLoading && pageNumber !== 1 && (
        <Box
          className="loadingAnimation"
          width="20px"
          height="20px"
          margin="auto"
        />
      )}

      {!postLoading &&
        posts?.length === 0 &&
        !followSuggestions &&
        location.pathname === "/" && (
          <Box
            display="flex"
            alignItems="center"
            flexDirection="column"
            mb="40px"
            sx={{ userSelect: "none" }}
          >
            <img
              src="\assets\repair.svg"
              alt=""
              width={isNonMobileScreens ? "400" : "250"}
              style={{ pointerEvents: "none" }}
            />

            <Typography fontSize="24px">Come back later</Typography>

            <Typography color={palette.text.secondary} fontSize="15px">
              Sorry there is a problem with the server
            </Typography>
          </Box>
        )}

      {!postLoading &&
        posts?.length === 0 &&
        location.pathname.split("/")[1] === "profile" && (
          <Typography
            textAlign="center"
            fontSize="26px"
            color={palette.neutral.medium}
            mt={isNonMobileScreens ? "25px" : "110px"}
            mb="20px"
          >
            No posts available
          </Typography>
        )}
    </Box>
  );
};

export default PostWidget;
