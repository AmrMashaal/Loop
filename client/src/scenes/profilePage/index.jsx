import { Box, useMediaQuery, useTheme } from "@mui/system";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Navbar from "../navbar";
import PostWidget from "../widgets/PostWidget";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostClick from "../../components/post/PostClick";
import { debounce } from "lodash";
import { setLogin } from "../../../state";
import ProfileInfo from "../../components/profile/ProfileInfo";
import { Divider, Typography } from "@mui/material";
import FriendsWidget from "../widgets/FriendsWidget";
import MyPostWidget from "../widgets/MyPostWidget";
import PostSkeleton from "../skeleton/PostSkeleton";
import WrongPassword from "../../components/WrongPassword";
import socket from "../../components/socket";
import ProfileFriends from "../../components/friends/ProfileFriends";
import ProfileAbout from "../../components/profile/ProfileAbout";
import { posts, setIsOverFlow, setPosts } from "../../App";
import ProfileBadges from "../../components/profile/ProfileBadges";

const ProfilePage = () => {
  const [page, setPage] = useState(1);
  const [postsCount, setPostsCount] = useState(0);
  const [postClickType, setPostClickType] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState(false);
  const [isPostClicked, setIsPostClicked] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [postClickData, setPostClickData] = useState({
    picturePath: "",
    firstName: "",
    lastName: "",
    userPicturePath: "",
    description: "",
    _id: "",
    userId: "",
    verified: "",
  });

  const { userId } = useParams();

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const dispatch = useDispatch();

  const { palette } = useTheme();

  const isNonMobileScreens = useMediaQuery("(min-width: 1060px)");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isPostClicked) {
      setIsOverFlow(true);
    } else {
      setIsOverFlow(false);
    }
  }, [isPostClicked]);

  async function getPosts(reset = false) {
    page === 1 && setIsLoading(true);
    page === 1 && setPosts([]);

    try {
      const response = await fetch(
        `/api/posts/${userId}/posts?page=${page}&limit=5`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newPosts = await response.json();

      if (reset) {
        setPosts(newPosts.posts);
      } else {
        setPosts([...posts, ...newPosts.posts]);
      }

      setPostsCount(newPosts.count);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (page === 1) {
      getPosts(true);
    } else {
      getPosts();
    }
  }, [page, userId]);

  const getMorePosts = () => {
    setPage((prevNum) => prevNum + 1);
  };

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        window.scrollY + window.innerHeight >=
          document.body.offsetHeight - 10 &&
        !isLoading &&
        posts?.length < postsCount &&
        location.pathname.split("/")[
          location.pathname.split("/")?.length - 1
        ] !== "friends" &&
        location.pathname.split("/")[
          location.pathname.split("/")?.length - 1
        ] !== "about"
      ) {
        getMorePosts();
      }
    }, 300);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [postsCount, posts?.length]);

  const userData = async () => {
    setUserInfo(null);
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.message) {
        setProfileError(true);
      }

      setUserInfo(data);
      if (user._id === data._id) {
        dispatch(setLogin({ token, user: data }));
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    if (userInfo?.firstName !== undefined) {
      document.title = `Loop - ${userInfo?.firstName} ${userInfo?.lastName}`;
    }
  }, [userInfo]);

  useEffect(() => {
    userData();
    setPage(1);
    setIsPostClicked(false);
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [userId]);

  useEffect(() => {
    if (profileError) {
      document.title = `Loop`;
    }
  }, [profileError]);

  const returnToHome = () => {
    setTimeout(() => {
      navigate("/");
    }, 3000);
  };

  const checkCorrectPassword = async () => {
    try {
      const response = await fetch(
        `/api/users/${user._id}/checkCorrectPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ passwordChangedAt: user.passwordChangedAt }),
        }
      );

      const result = await response.json();

      if (result.message === "Password is not correct") {
        setWrongPassword(true);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    checkCorrectPassword();
  }, []);

  return (
    <div style={{ marginBottom: !isNonMobileScreens ? "71px" : "" }}>
      {!profileError ? (
        <>
          <Navbar isProfile={true} />

          <ProfileInfo
            userInfo={userInfo}
            userId={userId}
            isLoading={isLoading}
          />

          <Box
            display="flex"
            flexDirection="column"
            mt={() => {
              if (!isNonMobileScreens && userInfo?.bio?.length >= 180) {
                return "612px";
              } else if (
                isNonMobileScreens &&
                userInfo?.bio &&
                userInfo?.bio.length < 180
              ) {
                return "270px";
              } else if (
                !isNonMobileScreens &&
                userInfo?.bio &&
                !userInfo?.bio.length < 180
              ) {
                return "398px";
              } else if (isNonMobileScreens && !userInfo?.bio) {
                return "230px";
              } else if (!isNonMobileScreens && !userInfo?.bio) {
                return "350px";
              } else if (isNonMobileScreens && userInfo?.bio?.length >= 180) {
                return "350px";
              }
            }}
            className="profileContainer"
          >
            <Divider />

            <Box
              m="10px 25px"
              display="flex"
              flexWrap="wrap"
              gap="20px"
              alignItems="center"
              justifyContent={isNonMobileScreens ? "start" : "center"}
            >
              <Link to={`/profile/${userId}`}>
                <Typography
                  fontSize="18px"
                  color={
                    !location.pathname.split("/")[3]
                      ? "#00D5FA"
                      : palette.neutral.medium
                  }
                  p="3px"
                  borderBottom={
                    !location.pathname.split("/")[3] && "3px solid #00D5FA"
                  }
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  className="opacityBox"
                >
                  Posts
                </Typography>
              </Link>

              <Link to={`/profile/${userId}/about`}>
                <Typography
                  fontSize="18px"
                  p="3px"
                  color={
                    location.pathname.split("/")[3] === "about"
                      ? "#00D5FA"
                      : palette.neutral.medium
                  }
                  borderBottom={
                    location.pathname.split("/")[3] === "about" &&
                    "3px solid #00D5FA"
                  }
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  className="opacityBox"
                  onClick={() => setPage(1)}
                >
                  About
                </Typography>
              </Link>

              <Link to={`/profile/${userId}/friends`}>
                <Typography
                  fontSize="18px"
                  p="3px"
                  color={
                    location.pathname.split("/")[3] === "friends"
                      ? "#00D5FA"
                      : palette.neutral.medium
                  }
                  borderBottom={
                    location.pathname.split("/")[3] === "friends" &&
                    "3px solid #00D5FA"
                  }
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  className="opacityBox"
                  onClick={() => setPage(1)}
                >
                  Friends
                </Typography>
              </Link>

              <Link to={`/profile/${userId}/badges`}>
                <Typography
                  fontSize="18px"
                  p="3px"
                  color={
                    location.pathname.split("/")[3] === "badges"
                      ? "#00D5FA"
                      : palette.neutral.medium
                  }
                  borderBottom={
                    location.pathname.split("/")[3] === "badges" &&
                    "3px solid #00D5FA"
                  }
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  className="opacityBox"
                  onClick={() => setPage(1)}
                >
                  Badges
                </Typography>
              </Link>
            </Box>

            <Box
              display={!location.pathname.split("/")[3] && "flex"}
              gap="10px"
              justifyContent="space-between"
              flexDirection={isNonMobileScreens ? "row" : "column"}
              padding="10px"
            >
              {location.pathname.split("/")[3] === "about" && (
                <ProfileAbout userParam={userId} userInfo={userInfo} />
              )}

              {location.pathname.split("/")[3] === "friends" && (
                <ProfileFriends userParam={userId} />
              )}

              {location.pathname.split("/")[3] === "badges" && (
                <ProfileBadges
                  userParam={userId}
                  userInfo={userInfo}
                  token={token}
                  userId={userId}
                />
              )}

              <Box
                width={isNonMobileScreens ? "730px" : "100%"}
                height="100%"
                position={isNonMobileScreens ? "sticky" : undefined}
                top={isNonMobileScreens ? "93px" : undefined}
                mt={isNonMobileScreens ? undefined : "10px"}
              >
                {!location.pathname.split("/")[3] && (
                  <FriendsWidget
                    type="friends"
                    userId={userId}
                    description="Friends"
                    isNonMobileScreens={isNonMobileScreens}
                  />
                )}
              </Box>

              <Box width="100%">
                {userId === user._id && !location.pathname.split("/")[3] && (
                  <MyPostWidget
                    picturePath={user.picturePath}
                    socket={socket}
                  />
                )}

                <Box mt={isNonMobileScreens ? undefined : "-87px"}>
                  <Box zIndex="1" mt={!isNonMobileScreens ? "95px" : "0"}>
                    {!location.pathname.split("/")[3] &&
                      (isLoading ? (
                        <PostSkeleton />
                      ) : (
                        <>
                          <PostWidget
                            posts={posts}
                            postClickData={postClickData}
                            setPostClickData={setPostClickData}
                            isPostClicked={isPostClicked}
                            setIsPostClicked={setIsPostClicked}
                            postLoading={isLoading}
                            setPostClickType={setPostClickType}
                          />

                          {isPostClicked && (
                            <PostClick
                              picturePath={postClickData.picturePath}
                              firstName={postClickData.firstName}
                              lastName={postClickData.lastName}
                              userPicturePath={postClickData.userPicturePath}
                              description={postClickData.description}
                              setIsPostClicked={setIsPostClicked}
                              _id={postClickData._id}
                              userId={postClickData.userId}
                              verified={postClickData.verified}
                              postClickType={postClickType}
                            />
                          )}
                        </>
                      ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </>
      ) : (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            ":before": {
              content: "''",
              position: "absolute",
              padding: "6px",
              background: "red",
              left: "50%",
              transform: "rotate(40deg) translate(-50%, -50%)",
              top: "50%",
              zIndex: "-1",
              height: "400px",
              transformOrigin: "top",
            },
            ":after": {
              content: "''",
              position: "absolute",
              padding: "6px",
              background: "red",
              left: "50%",
              transform: "rotate(-40deg) translate(-50%, -50%)",
              top: "50%",
              zIndex: "-1",
              height: "400px",
              transformOrigin: "top",
            },
          }}
        >
          <Typography
            fontSize={isNonMobileScreens ? "50px" : "35px"}
            bgcolor="#000000a8"
            textTransform="capitalize"
            color="white"
          >
            this profile does not exist or has been deleted
            {returnToHome()}
          </Typography>
        </Box>
      )}

      {wrongPassword && <WrongPassword />}
    </div>
  );
};

export default ProfilePage;
