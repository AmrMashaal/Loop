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
import { useDispatch, useSelector } from "react-redux";
import FlexBetween from "../../components/FlexBetween";
import WidgetWrapper from "../../components/WidgetWrapper";
import UserImage from "../../components/UserImage";
import { setPost, setDeletePost, setPosts } from "../../../state";
import DeleteComponent from "../../components/post/DeleteComponent";
import UserDot from "../../components/post/UserDot";
import LikePost from "../../components/post/LikePost";
import WhoLiked from "../../components/WhoLiked";
import PostImg from "../../components/post/PostImg";
import PostEdited from "../../components/post/PostEdited";
import PostSkeleton from "../skeleton/PostSkeleton";
import socket from "../../components/socket";
import DOMPurify from "dompurify";
import { setIsOverFlow } from "../../App";
import ChangePrivacy from "../../components/post/ChangePrivacy";

const PostWidget = ({
  posts,
  setPostClickData,
  isPostClicked,
  setIsPostClicked,
  postLoading,
}) => {
  const [showLikes, setShowLikes] = useState(false);
  const [likesLoading, setLikesLoading] = useState(false);
  const [changePrivacyLoading, setChangePrivacyLoading] = useState(false);
  const [isChangePrivacy, setIsChangePrivacy] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
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

  const dispatch = useDispatch();

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

  const whoLikes = async (postId, initial = false) => {
    setLikesLoading(true);
    try {
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
        `${import.meta.env.VITE_API_URL}/likes/${postId}/${user._id}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedPost = await response1.json();

      if (response1.ok) {
        dispatch(setPost({ post_id: postId, post: updatedPost.post }));
      }

      if (ele.userId !== user._id && updatedPost.isLiked) {
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

      dispatch(setDeletePost({ postId: postWhoDeleted }));
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handleEditPost = async (e, editText, description) => {
    e.preventDefault();
    if (editText !== description && editText) {
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
        dispatch(setPost({ post_id: postInfo.postId, post: data }));
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

      dispatch(
        setPosts({
          posts: [data, ...posts.filter((ele) => ele._id !== data._id)],
        })
      );
    } catch (error) {
      if (import.meta.env.MODE === "development") {
        console.error(error);
      }
    } finally {
      setIsChangePrivacy(false);
      setChangePrivacyLoading(false);
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
                  <Link to={`/profile/${ele.userId}`}>
                    <FlexBetween gap="10px">
                      <Box sx={{ cursor: "pointer" }}>
                        <UserImage image={ele.userPicturePath} size="40px" />
                      </Box>
                      <Box>
                        <Box
                          sx={{ cursor: "pointer" }}
                          display="flex"
                          alignItems="center"
                          gap="4px"
                        >
                          <Typography fontSize="14px" className="opacityBox">
                            {ele?.firstName} {ele?.lastName}
                          </Typography>
                          {ele?.verified && (
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
                  {ele.userId === user._id && (
                    <IconButton
                      onClick={() => {
                        setIsDots(true),
                          setPostInfo({ postId: ele._id, userId: ele.userId });
                      }}
                    >
                      <MoreHoriz />
                    </IconButton>
                  )}
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
                    fontSize={howIsText(
                      ele?.description,
                      ele?.picturePath,
                      textAddition
                    )}
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
                      direction: testArabic(ele?.description) && "rtl",
                      textAlign: textAddition.type === "color",
                      p: textAddition?.value === "quotation" && "25px",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        convertTextLink(
                          ele?.description?.length > 180
                            ? ele?.description.slice(0, 179)
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
                    ele={ele}
                  />
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
              WhoLikes={whoLikes}
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

      {!postLoading &&
        posts?.length === 0 &&
        location.pathname.split("/")[1] === "profile" && (
          <Box
            display="flex"
            gap="15px"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            mb="10px"
          >
            <img
              src="/assets/5784488_2968170-removebg-preview.png"
              alt=""
              width="280"
              style={{ userSelect: "none", maxWidth: "100%" }}
            />

            <Typography
              fontSize={isNonMobileScreens ? "18px" : "14px"}
              textTransform="uppercase"
            >
              {user._id === userId ? (
                <>You haven&apos;t</>
              ) : (
                <>
                  <span>This user </span>
                  hasn&apos;t
                </>
              )}{" "}
              shared anything yet
            </Typography>
          </Box>
        )}
    </>
  );
};

export default PostWidget;
