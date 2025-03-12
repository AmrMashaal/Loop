/* eslint-disable react/prop-types */
import { IconButton, Typography } from "@mui/material";
import {
  VerifiedOutlined,
  MoreHoriz,
  PushPinOutlined,
  Public,
  Lock,
  People,
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
import { convertTextLink } from "../../frequentFunctions";

const PostWidget = ({
  setPostClickData,
  isPostClicked,
  setIsPostClicked,
  postLoading,
  setPostClickType,
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
          `${import.meta.env.VITE_API_URL}/likes/${
            postId._id
          }/repost?page=${page}`,
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
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/likes/${postId}/post?page=${page}`,
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
        `${import.meta.env.VITE_API_URL}/likes/${postId}/${user._id}/${
          typeof ele.userId !== "object" ? "like" : "likeRepost"
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
        (ele.userId !== user._id && ele.userId._id !== user._id) &&
        updatedPost.isLiked
      ) {
        const response2 = await fetch(
          `${import.meta.env.VITE_API_URL}/notifications/${user._id}/${
            ele.userId
          }`,
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
              receiverId: ele.userId,
              senderId: user._id,
            }),
          }
        );

        const notification = await response2.json();

        socket.emit("notifications", {
          receiverId: ele.userId,
          notification: notification,
        });
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
      await fetch(
        `${import.meta.env.VITE_API_URL}/posts/${postWhoDeleted}/delete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setPosts(posts.filter((ele) => ele._id !== postWhoDeleted));
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handleEditPost = async (e, editText, description) => {
    e.preventDefault();
    if (editText !== description) {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${postInfo.postId}/edit`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ description: editText }),
          }
        );

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
        `${import.meta.env.VITE_API_URL}/posts/${
          postInfo.postId
        }/changePrivacy`,
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

      setPosts([data, ...posts.filter((ele) => ele._id !== data._id)]);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/reposts`, {
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

  // eslint-disable-next-line react/prop-types
  return (
    <>
      {posts && (
        <>
          {posts?.map((ele, index) => {
            const textAddition = ele?.textAddition
              ? JSON.parse(ele?.textAddition)
              : "";

            return (
              <WidgetWrapper mb="10px" key={index}>
                <FlexBetween>
                  <Link
                    to={`/profile/${
                      typeof ele.userId === "object"
                        ? ele.userId._id
                        : ele.userId
                    }`}
                  >
                    <FlexBetween gap="10px">
                      <Box sx={{ cursor: "pointer" }}>
                        <UserImage
                          image={
                            typeof ele.userId === "object"
                              ? ele.userId.picturePath
                              : ele.userPicturePath
                          }
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
                          <Typography fontSize="14px" className="opacityBox">
                            {typeof ele.userId === "object"
                              ? ele.userId.firstName
                              : ele.firstName}{" "}
                            {typeof ele.userId === "object"
                              ? ele.userId.lastName
                              : ele.lastName}
                          </Typography>

                          {typeof ele.userId === "object" &&
                          ele.userId.verified ? (
                            <VerifiedOutlined sx={{ color: "#15a1ed" }} />
                          ) : ele.verified ? (
                            <VerifiedOutlined sx={{ color: "#15a1ed" }} />
                          ) : undefined}
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
                            location.pathname.split("/")[1] === "profile" && (
                              <Box
                                display="flex"
                                alignItems="center"
                                gap="2px"
                                fontWeight="500"
                                fontSize="11px"
                              >
                                | Pinned
                                <PushPinOutlined sx={{ fontSize: "14px" }} />
                              </Box>
                            )}
                        </Typography>
                      </Box>
                    </FlexBetween>
                  </Link>

                  {typeof ele.userId === "object" &&
                  ele.userId._id === user._id ? (
                    <IconButton
                      onClick={() => {
                        setIsDots(true),
                          setPostInfo({ postId: ele._id, userId: ele.userId });
                      }}
                    >
                      <MoreHoriz />
                    </IconButton>
                  ) : ele.userId === user._id ? (
                    <IconButton
                      onClick={() => {
                        setIsDots(true),
                          setPostInfo({ postId: ele._id, userId: ele.userId });
                      }}
                    >
                      <MoreHoriz />
                    </IconButton>
                  ) : undefined}
                </FlexBetween>

                <Box
                  border={textAddition?.value === "quotation" && "2px solid "}
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
                  textAlign={
                    (textAddition?.value === "quotation" ||
                      textAddition.type === "color") &&
                    "center"
                  }
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
                  }}
                  onClick={() => {
                    if (textAddition?.type === "color") {
                      setIsPostClicked(true),
                        setPostClickType("post"),
                        setPostClickData({
                          firstName: ele?.firstName,
                          lastName: ele?.lastName,
                          picturePath: ele?.picturePath,
                          userPicturePath: ele?.userPicturePath,
                          description: ele?.description,
                          _id: ele?._id,
                          userId: ele?.userId,
                          verified: ele?.verified,
                        });
                    }
                  }}
                >
                  <Typography
                    position="relative"
                    fontWeight={textAddition?.value === "bold" && "bold"}
                    fontSize={
                      typeof ele.userId === "object"
                        ? "14px"
                        : howIsText(
                            ele?.description,
                            ele?.picturePath,
                            textAddition
                          )
                    }
                    color={
                      textAddition?.value ===
                        "linear-gradient(to right, #89003054, #007a3342, #00000000)" &&
                      mode === "light" &&
                      "black"
                    }
                    textTransform={
                      textAddition?.value === "quotation"
                        ? "capitalize"
                        : textAddition?.value === "uppercase"
                        ? "uppercase"
                        : undefined
                    }
                    sx={{
                      wordBreak: "break-word",
                      lineHeight: "1.7",
                      direction: testArabic(ele?.description) && "rtl",
                      textAlign: textAddition.type === "color",
                      p: textAddition?.value === "quotation" && "25px",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        convertTextLink(
                          ele?.description?.length > 180
                            ? ele?.description?.slice(0, 179)
                            : ele?.description
                        ),
                        {
                          ADD_ATTR: ["target", "rel"],
                        }
                      ),
                    }}
                    className={
                      textAddition?.value === "quotation" && "postText"
                    }
                  />

                  {ele?.description?.length > 180 && (
                    <span
                      style={{
                        fontWeight: "600",
                        cursor: "pointer",
                        userSelect: "none",
                      }}
                      onClick={() => {
                        setIsPostClicked(true),
                          setPostClickType("post"),
                          setPostClickData({
                            firstName: ele?.firstName,
                            lastName: ele?.lastName,
                            picturePath: ele?.picturePath,
                            userPicturePath: ele?.userPicturePath,
                            description: ele?.description,
                            _id: ele?._id,
                            userId: ele?.userId,
                            verified: ele?.verified,
                          });
                      }}
                    >
                      ...more
                    </span>
                  )}
                </Box>

                {ele.picturePath && (
                  <PostImg
                    setIsPostClicked={setIsPostClicked}
                    setPostClickData={setPostClickData}
                    setPostClickType={setPostClickType}
                    ele={ele}
                  />
                )}

                {typeof ele.userId === "object" && (
                  <Box borderRadius="0.75rem">
                    {ele?.postId?.picturePath && (
                      <PostImg
                        setIsPostClicked={setIsPostClicked}
                        setPostClickType={setPostClickType}
                        setPostClickData={setPostClickData}
                        ele={ele.postId}
                        isRepost={true}
                      />
                    )}

                    <Box
                      mt={ele?.postId?.picturePath ? "-17px" : "13px"}
                      border="1px solid"
                      borderColor={palette.neutral.light}
                      p="10px"
                    >
                      {ele?.postId !== null ? (
                        <Link
                          to={`/profile/${ele?.postId?.userId}`}
                          style={{ width: "fit-content", display: "block" }}
                        >
                          <Box gap="10px" display="flex" alignItems="center">
                            <Box sx={{ cursor: "pointer" }}>
                              <UserImage
                                image={
                                  typeof ele?.userId === "object"
                                    ? ele?.postId?.userPicturePath
                                    : ele?.userPicturePath
                                }
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
                                  {typeof ele?.userId === "object"
                                    ? ele?.postId?.firstName
                                    : ele?.firstName}{" "}
                                  {typeof ele?.userId === "object"
                                    ? ele?.postId?.lastName
                                    : ele?.lastName}
                                </Typography>

                                {ele.postId?.verified && (
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
                                {timeAgo(ele?.postId?.createdAt)}{" "}
                                {ele?.postId?.privacy === "public" ? (
                                  <Public sx={{ fontSize: "15px" }} />
                                ) : ele?.postId?.privacy === "friends" ? (
                                  <People sx={{ fontSize: "15px" }} />
                                ) : (
                                  <Lock sx={{ fontSize: "15px" }} />
                                )}
                                {ele?.edited && (
                                  <Typography fontWeight="500" fontSize="11px">
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
                              owner only shared it with a small group of people,
                              changed who can see it or it&apos;s been deleted.
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
                                convertTextLink(
                                  ele?.postId?.description?.length > 180
                                    ? ele?.postId?.description.slice(0, 179)
                                    : ele?.postId?.description
                                ),
                                {
                                  ADD_ATTR: ["target", "rel"],
                                }
                              ),
                            }}
                          />

                          {ele?.postId?.description?.length > 180 && (
                            <span
                              style={{
                                fontWeight: "600",
                                cursor: "pointer",
                                userSelect: "none",
                              }}
                              onClick={() => {
                                setIsPostClicked(true),
                                  setPostClickType("post"),
                                  setPostClickData({
                                    firstName: ele?.postId?.firstName,
                                    lastName: ele?.postId?.lastName,
                                    picturePath: ele?.postId?.picturePath,
                                    userPicturePath:
                                      ele?.postId?.userPicturePath,
                                    description: ele?.postId?.description,
                                    _id: ele?.postId?._id,
                                    userId: ele?.postId?.userId,
                                    verified: ele?.postId?.verified,
                                  });
                              }}
                            >
                              ...more
                            </span>
                          )}
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

      {postLoading && <PostSkeleton />}

      {!postLoading && posts?.length === 0 && location.pathname === "/" && (
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
    </>
  );
};

export default PostWidget;
