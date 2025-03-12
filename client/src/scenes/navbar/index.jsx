import FlexBetween from "../../components/FlexBetween";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Search,
  DarkMode,
  LightMode,
  Close,
  People,
  Message,
  Notifications,
  HomeOutlined,
  MessageOutlined,
  PeopleOutline,
  NotificationsOutlined,
  Home,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout, setFriendsRequest } from "../../../state/index";
import { Link, useNavigate } from "react-router-dom";
import FriendsRequest from "../widgets/FriendsRequest";
import NotificationData from "../widgets/NotificationData";
import socket from "../../components/socket";
import UserImage from "../../components/UserImage";

// eslint-disable-next-line react/prop-types
const Navbar = ({ isProfile }) => {
  const [openRequests, setOpenRequests] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [isDeleteNotifications, setIsDeleteNotifications] = useState(false);
  const [returnNavColor, setReturnNavColor] = useState(true);
  const [requestLoading, setRequestLoading] = useState(true);
  const [isClickProfile, setIsClickProfile] = useState(false);
  const [friendsRequestData, setFriendRequestData] = useState([]);
  const [notificationsState, setNotificationsState] = useState(null);
  const [watchedNotifications, setWatchedNotifications] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchValue, setSearchValue] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const mode = useSelector((state) => state.mode);

  const searchRef = useRef();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const neutrallLight = theme.palette.neutral.light;
  const alt = theme.palette.background.alt;

  const friendsRequest = async () => {
    setRequestLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/friendRequest/${user._id}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      setFriendRequestData(data);
      dispatch(setFriendsRequest({ friendsRequestState: data }));
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setRequestLoading(false);
    }
  };

  const getNotifications = async (initial = false) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${
          user._id
        }?page=${pageNumber}&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (initial) {
        setNotificationsState(data);
      } else {
        setNotificationsState((prev) => [...prev, ...data]);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handleWatchNotification = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${user._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setWatchedNotifications(null);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const handleDeleteNotifications = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/notifications/${user._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setNotificationsState(null);
        setWatchedNotifications(null);
        setIsDeleteNotifications(false);
        setIsNotification(false);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const getMoreNotifications = () => {
    setPageNumber((prev) => prev + 1);
  };

  useEffect(() => {
    const removeIsClickProfile = (event) => {
      const elementId = document.getElementById("profileNav");

      if (!elementId?.contains(event.target)) {
        setIsClickProfile(false);
      }
    };

    document.addEventListener("click", removeIsClickProfile);

    const navScroll = () => {
      if (window.scrollY > 77) {
        setReturnNavColor(false);
      } else {
        setReturnNavColor(true);
      }
    };

    if (isProfile) {
      document.addEventListener("scroll", navScroll);
    }

    return () => {
      if (isProfile) {
        document.removeEventListener("scroll", navScroll);
      }

      document.removeEventListener("click", removeIsClickProfile);
    };
  }, []);

  useEffect(() => {
    if (openRequests) {
      friendsRequest();
    }
  }, [openRequests]);

  useEffect(() => {
    if (import.meta.env.VITE_NODE_ENV !== "production") {
      socket.on("getNotifications", (data) => {
        setNotificationsState((prev) =>
          notificationsState?.length === 0 ? data : [data, ...(prev || [])]
        );
      });

      socket.on("friendNewPost", (data) => {
        setNotificationsState((prev) =>
          notificationsState?.length === 0 ? data : [data, ...(prev || [])]
        );
      });

      return () => {
        socket.off("getNotifications");
        socket.off("friendNewPost");
      };
    }
  }, [socket]);

  useEffect(() => {
    setWatchedNotifications(
      notificationsState?.length > 0
        ? notificationsState?.filter((ele) => ele.watched === false)
        : null
    );

    return () => {
      setWatchedNotifications(null);
    };
  }, [notificationsState]);

  useEffect(() => {
    if (pageNumber === 1) {
      getNotifications(true);
    } else {
      getNotifications();
    }
  }, [pageNumber]);

  const disconnectSocket = async () => {
    socket.disconnect();

    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/users/${user._id}/onlineState`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            makeOnline: false,
          }),
        }
      );
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  return (
    <FlexBetween
      padding="10px"
      bgcolor={isProfile && returnNavColor ? undefined : alt}
      p="12px 30px"
      position="fixed"
      top="-1px"
      left="0"
      width="100%"
      zIndex="1111"
      sx={{
        boxShadow:
          isProfile && returnNavColor
            ? undefined
            : "-1px 11px 11px 0px #00000008",
        transition: isProfile ? ".3s" : undefined,
      }}
    >
      <img
        src="\assets\ramadan.png"
        alt=""
        style={{
          position: "absolute",
          top: "10px",
          left: "0",
          width: "180px",
          transform: "rotate(-20deg)",
          zIndex: "-1",
          userSelect: "none",
          pointerEvents: "none",
        }}
      />

      <FlexBetween gap="15px">
        <Box
          display="flex"
          alignItems="center"
          flexDirection="column"
          overflow="hidden"
          sx={{
            userSelect: "none",
            cursor: "pointer",
            ":hover": {
              ".imageArrow": {
                left: "70px !important",
              },
            },
          }}
          onClick={() => navigate("/")}
        >
          <img
            src="/assets/logoSInArrow.png"
            alt="loop-icon"
            width={isNonMobileScreens ? "50" : "40"}
            style={{ pointerEvents: "none" }}
          />
          <img
            src="/assets/arrow.png"
            alt="loop-icon"
            width={isNonMobileScreens ? "50" : "40"}
            className="imageArrow"
            style={{
              transition: ".3s",
              pointerEvents: "none",
              position: "relative",
              left: "0",
            }}
          />
        </Box>

        {isNonMobileScreens && (
          <FlexBetween
            backgroundColor={neutrallLight}
            padding="2px 38px 2px 7px"
            borderRadius="9px"
            gap="3px"
            position="relative"
            sx={{
              transition: ".3s width",
              width: "300px",
              background:
                isProfile && returnNavColor && mode === "light"
                  ? "#f0f0f0b3"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
              ":focus-within": {
                width: "410px",
              },
            }}
          >
            <form
              style={{
                width: "100%",
              }}
              onSubmit={(e) => {
                e.preventDefault();
                if (searchValue.length > 0 && searchValue.trim().length > 0) {
                  navigate(`/search/${encodeURIComponent(searchValue)}`);
                }
              }}
            >
              <InputBase
                fullWidth
                inputRef={searchRef}
                value={searchValue}
                onChange={(e) => {
                  if (e.target.value.length <= 50) {
                    setSearchValue(e.target.value);
                  }
                }}
                placeholder="Search for users, posts"
              />
              <IconButton
                type="submit"
                sx={{
                  position: "absolute",
                  top: "50%",
                  right: "0%",
                  transform: "translateY(-50%)",
                }}
              >
                <Search />
              </IconButton>
            </form>
          </FlexBetween>
        )}
      </FlexBetween>

      {/* Desktop Navigate */}
      {isNonMobileScreens ? (
        <FlexBetween gap="10px">
          <IconButton
            sx={{
              position: "relative",
              bgcolor:
                isProfile && returnNavColor && mode === "light"
                  ? "#f0f0f0b3"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
            }}
            onClick={() => setOpenRequests(true)}
          >
            <People sx={{ fontSize: "25px" }} />
            {user?.friendsRequest?.length > 0 && (
              <Typography
                position="absolute"
                right="0px"
                top="3px"
                padding="0px 3px"
                bgcolor="red"
                borderRadius="6px"
                fontSize="11px"
                color="white"
              >
                {user?.friendsRequest?.length < 100
                  ? user?.friendsRequest?.length
                  : "+99"}
              </Typography>
            )}
          </IconButton>

          <Link to="/chat">
            <IconButton
              sx={{
                position: "relative",
                bgcolor:
                  isProfile && returnNavColor && mode === "light"
                    ? "#f0f0f0b3"
                    : isProfile && returnNavColor && mode === "dark"
                    ? "#33333391"
                    : undefined,
              }}
            >
              <Message sx={{ fontSize: "25px" }} />
            </IconButton>
          </Link>

          <IconButton
            sx={{
              position: "relative",
              bgcolor:
                isProfile && returnNavColor && mode === "light"
                  ? "#f0f0f0b3"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
            }}
            onClick={() => {
              setIsNotification(true),
                handleWatchNotification(),
                setIsDeleteNotifications(false);
              if (
                notificationsState !== null &&
                notificationsState?.length !== 0
              ) {
                setNotificationsState(
                  notificationsState?.map((ele) => {
                    return { ...ele, watched: true };
                  })
                );
              }
            }}
          >
            <Notifications sx={{ fontSize: "25px" }} />
            <Typography
              position="absolute"
              top="-2px"
              right="0"
              p="3px"
              sx={{
                width: "17px",
                borderRadius: "50%",
                bgcolor:
                  watchedNotifications?.length !== 0 &&
                  watchedNotifications !== null
                    ? "red"
                    : undefined,
                height: "17px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                padding: "10px",
                color: "white",
              }}
            >
              {watchedNotifications?.length > 99
                ? "+99"
                : watchedNotifications?.length !== 0
                ? watchedNotifications?.length
                : undefined}
            </Typography>
          </IconButton>

          <Box
            p="3px"
            width="130px"
            height="36px"
            mr="10px"
            bgcolor={
              isProfile && returnNavColor && mode === "light"
                ? "#f0f0f0b3"
                : isProfile && returnNavColor && mode === "dark"
                ? "#33333391"
                : neutrallLight
            }
            borderRadius="50px"
            position="relative"
            boxShadow="inset -1px 2px 3px 2px #00000045"
            outline={`${
              isProfile && returnNavColor && mode === "light"
                ? "#f0f0f0b3"
                : isProfile && returnNavColor && mode === "dark"
                ? "#33333391"
                : neutrallLight
            } solid 5px`}
            sx={{ cursor: "pointer" }}
            onClick={() => dispatch(setMode())}
          >
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                backgroundColor: mode === "dark" ? "#3e3e3e" : neutrallLight,
                transition: ".3s",
                left: mode === "dark" ? "0" : "89px",
                boxShadow: "0px 0px 10px 0px #00000054",
                width: "41px",
                height: "41px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: "11",
                ":hover": {
                  background: mode === "dark" ? neutrallLight : "#dedede",
                },
              }}
            >
              {theme.palette.mode === "light" ? (
                <LightMode sx={{ fontSize: "25px" }} />
              ) : (
                <DarkMode sx={{ fontSize: "25px" }} />
              )}
            </Box>

            <Typography
              position="absolute"
              top="50%"
              left={mode === "dark" ? "57px" : "10px"}
              textTransform="uppercase"
              fontSize="11px"
              sx={{
                transform: "translateY(-50%)",
                transition: ".3s",
                userSelect: "none",
              }}
            >
              {mode === "dark" ? "dark mode" : "light mode"}
            </Typography>
          </Box>

          <Box
            sx={{ cursor: "pointer", userSelect: "none" }}
            position="relative"
            onClick={() => setIsClickProfile(true)}
            id="profileNav"
          >
            <UserImage
              image={user.picturePath}
              size="36"
              isNav={true}
              isActive={
                location.pathname === `/profile/${user._id}` ? true : false
              }
            />

            {isClickProfile && isNonMobileScreens && (
              <Box
                position="absolute"
                width="150px"
                bottom="-60px"
                right="20px"
                zIndex="111"
                bgcolor={alt}
                border="1px solid #0000001f"
                sx={{ cursor: "auto" }}
              >
                <Link to={`/profile/${user._id}`}>
                  <Typography
                    sx={{
                      cursor:
                        location.pathname !== `/profile/${user._id}`
                          ? "pointer"
                          : "context-menu",
                      ":hover": {
                        bgcolor:
                          location.pathname !== `/profile/${user._id}` &&
                          (mode === "light" ? "#f0f0f0" : "#333333"),
                      },
                      opacity:
                        location.pathname === `/profile/${user._id}` ? 0.5 : 1,
                    }}
                    p="8px"
                  >
                    Profile Page
                  </Typography>
                </Link>

                <Typography
                  mt="5px"
                  sx={{
                    cursor: "pointer",
                    ":hover": {
                      bgcolor: mode === "light" ? "#f0f0f0" : "#333333",
                    },
                  }}
                  p="8px"
                  onClick={() => {
                    dispatch(setLogout()), disconnectSocket();
                  }}
                >
                  Log Out
                </Typography>
              </Box>
            )}
          </Box>
        </FlexBetween>
      ) : (
        <Box display="flex" gap="7px">
          <Box
            onClick={() => setIsSearch(true)}
            sx={{
              width: "41px",
              height: "41px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor:
                isProfile && returnNavColor && mode === "light"
                  ? "#F0F0F0"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
              borderRadius: "50%",
            }}
          >
            <Search />
          </Box>

          <Box
            sx={{
              width: "41px",
              height: "41px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor:
                isProfile && returnNavColor && mode === "light"
                  ? "#F0F0F0"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
              borderRadius: "50%",
            }}
            onClick={() => dispatch(setMode())}
          >
            {theme.palette.mode === "light" ? (
              <LightMode sx={{ fontSize: "25px" }} />
            ) : (
              <DarkMode sx={{ fontSize: "25px" }} />
            )}
          </Box>
        </Box>
      )}

      {/* Mobile Navigate */}
      {!isNonMobileScreens && (
        <>
          {isSearch && (
            <Box
              width="100%"
              position="absolute"
              left="0"
              top="0"
              bgcolor={alt}
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <IconButton onClick={() => setIsSearch(false)}>
                <Close />
              </IconButton>
              <FlexBetween
                backgroundColor={neutrallLight}
                padding="5px 38px 5px 7px"
                borderRadius="9px"
                gap="3px"
                position="relative"
                width="70%"
              >
                <form
                  style={{ width: "100%" }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (
                      searchValue.length > 0 &&
                      searchValue.trim().length > 0
                    ) {
                      navigate(`/search/${encodeURIComponent(searchValue)}`);
                    }
                  }}
                >
                  <InputBase
                    fullWidth
                    inputRef={searchRef}
                    value={searchValue}
                    onChange={(e) => {
                      if (e.target.value.length <= 50) {
                        setSearchValue(e.target.value);
                      }
                    }}
                    placeholder="Search for users, posts"
                  />
                  <IconButton
                    type="submit"
                    sx={{
                      position: "absolute",
                      top: "50%",
                      right: "0%",
                      transform: "translateY(-50%)",
                    }}
                  >
                    <Search />
                  </IconButton>
                </form>
              </FlexBetween>
            </Box>
          )}

          <Box
            position="fixed"
            width="100%"
            padding="5px 10px 10px"
            zIndex="10"
            backgroundColor={mode === "light" ? "#ebebebb8" : "#1a1a1ade"}
            bottom="-3px"
            left="0"
            boxShadow="6px 2px 20px 0 #0000002d"
            borderTop="1px solid #0000001f"
            className="mobileNav"
          >
            <Box display="flex" justifyContent="space-around">
              <Link to={`/`}>
                <Box
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <IconButton sx={{ position: "relative" }}>
                    {location.pathname === "/" ? (
                      <Home
                        sx={{
                          fontSize: "25px",
                          color: "#0dc6f2",
                        }}
                      />
                    ) : (
                      <HomeOutlined
                        sx={{
                          fontSize: "25px",
                          color:
                            location.pathname === "/"
                              ? "#0dc6f2"
                              : mode === "dark"
                              ? "#c4c4c4"
                              : "",
                        }}
                      />
                    )}
                  </IconButton>

                  <Typography
                    mt="-4px"
                    color={mode === "light" ? "#0000008a" : "#c4c4c4"}
                    fontSize="11px"
                    fontWeight={location.pathname === "/" ? "500" : ""}
                  >
                    Home
                  </Typography>
                </Box>
              </Link>

              <Link to="/chat">
                <Box
                  sx={{ cursor: "pointer", userSelect: "none" }}
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                >
                  <IconButton
                    sx={{
                      position: "relative",
                      color: mode === "dark" ? "#c4c4c4" : "",
                    }}
                  >
                    <MessageOutlined sx={{ fontSize: "25px" }} />
                  </IconButton>

                  <Typography
                    mt="-4px"
                    color={mode === "light" ? "#0000008a" : "#c4c4c4"}
                    fontSize="11px"
                  >
                    Messages
                  </Typography>
                </Box>
              </Link>

              <Box
                sx={{ cursor: "pointer", userSelect: "none" }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                onClick={() => setOpenRequests(true)}
              >
                <IconButton
                  sx={{
                    position: "relative",
                    color: mode === "dark" ? "#c4c4c4" : "",
                  }}
                >
                  <PeopleOutline sx={{ fontSize: "25px" }} />

                  {user?.friendsRequest?.length > 0 && (
                    <Typography
                      position="absolute"
                      right="0px"
                      top="3px"
                      padding="0px 3px"
                      bgcolor="red"
                      borderRadius="6px"
                      fontSize="11px"
                      color="white"
                    >
                      {user?.friendsRequest?.length < 100
                        ? user?.friendsRequest?.length
                        : "+99"}
                    </Typography>
                  )}
                </IconButton>

                <Typography
                  mt="-4px"
                  color={mode === "light" ? "#0000008a" : "#c4c4c4"}
                  fontSize="11px"
                >
                  Requests
                </Typography>
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => {
                  setIsNotification(true),
                    handleWatchNotification(),
                    setIsDeleteNotifications(false);
                  if (
                    notificationsState !== null &&
                    notificationsState?.length !== 0
                  ) {
                    setNotificationsState(
                      notificationsState?.map((ele) => {
                        return { ...ele, watched: true };
                      })
                    );
                  }
                }}
              >
                <IconButton
                  sx={{
                    position: "relative",
                    color: mode === "dark" ? "#c4c4c4" : "",
                  }}
                >
                  <NotificationsOutlined sx={{ fontSize: "25px" }} />
                  <Typography
                    position="absolute"
                    top="-2px"
                    right="0"
                    p="3px"
                    sx={{
                      width: "17px",
                      borderRadius: "50%",
                      bgcolor:
                        watchedNotifications?.length !== 0 &&
                        watchedNotifications !== null
                          ? "red"
                          : undefined,
                      height: "17px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      padding: "10px",
                      color: "white",
                    }}
                  >
                    {watchedNotifications?.length > 99
                      ? "+99"
                      : watchedNotifications?.length !== 0
                      ? watchedNotifications?.length
                      : undefined}
                  </Typography>
                </IconButton>

                <Typography
                  mt="-4px"
                  color={mode === "light" ? "#0000008a" : "#c4c4c4"}
                  fontSize="11px"
                >
                  Notifications
                </Typography>
              </Box>

              <Box
                sx={{ cursor: "pointer", userSelect: "none" }}
                display="flex"
                flexDirection="column"
                alignItems="center"
                position="relative"
                onClick={() => setIsClickProfile(true)}
                id="profileNav"
              >
                <UserImage
                  image={user.picturePath}
                  size="36"
                  isNav={true}
                  isActive={
                    location.pathname === `/profile/${user._id}` ? true : false
                  }
                />

                <Typography
                  mt="-4px"
                  color={mode === "light" ? "#0000008a" : "#c4c4c4"}
                  fontSize="11px"
                  fontWeight={
                    location.pathname === `/profile/${user._id}` ? "500" : ""
                  }
                >
                  Profile
                </Typography>

                {isClickProfile && (
                  <Box
                    position="absolute"
                    width="150px"
                    bottom="40px"
                    right="20px"
                    zIndex="111"
                    bgcolor={alt}
                    border="1px solid #0000001f"
                    sx={{ cursor: "auto" }}
                  >
                    <Link to={`/profile/${user._id}`}>
                      <Typography
                        sx={{
                          cursor:
                            location.pathname !== `/profile/${user._id}`
                              ? "pointer"
                              : "context-menu",
                          ":hover": {
                            bgcolor:
                              location.pathname !== `/profile/${user._id}` &&
                              (mode === "light" ? "#f0f0f0" : "#333333"),
                          },
                          opacity:
                            location.pathname === `/profile/${user._id}`
                              ? 0.5
                              : 1,
                        }}
                        p="8px"
                      >
                        Profile Page
                      </Typography>
                    </Link>

                    <Typography
                      mt="5px"
                      sx={{
                        cursor: "pointer",
                        ":hover": {
                          bgcolor: mode === "light" ? "#f0f0f0" : "#333333",
                        },
                      }}
                      p="8px"
                      onClick={() => {
                        dispatch(setLogout()), disconnectSocket();
                      }}
                    >
                      Log Out
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </>
      )}

      {openRequests && (
        <FriendsRequest
          openRequests={openRequests}
          setOpenRequests={setOpenRequests}
          friendsRequestData={friendsRequestData}
          setFriendRequestData={setFriendRequestData}
          requestLoading={requestLoading}
        />
      )}

      {isNotification && !isDeleteNotifications && (
        <NotificationData
          openNotification={isNotification}
          setIsNotification={setIsNotification}
          notificationsState={notificationsState}
          isDeleteNotifications={isDeleteNotifications}
          setIsDeleteNotifications={setIsDeleteNotifications}
          getMoreNotifications={getMoreNotifications}
        />
      )}

      {isDeleteNotifications && (
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
            bgcolor="#00000066"
            onClick={() => setIsDeleteNotifications(false)}
          ></Box>

          <Box
            bgcolor={theme.palette.neutral.light}
            p="10px 28px"
            width={isNonMobileScreens ? "500px" : "100%"}
            display="flex"
            flexDirection="column"
            justifyContent="center"
            position="relative"
            height="100px"
            sx={{
              maxWidth: "100%",
              zIndex: "1",
              overflow: "auto",
              borderRadius: isNonMobileScreens ? "0.75rem" : "0",
            }}
          >
            <Box
              display="flex"
              gap="20px"
              alignItems="center"
              justifyContent="center"
            >
              <Button
                sx={{
                  bgcolor: "#9e1125b3",
                  color: "white",
                  width: "130px",
                  ":hover": {
                    bgcolor: "#760e1d47",
                  },
                }}
                onClick={() => {
                  setIsDeleteNotifications(false), handleDeleteNotifications();
                }}
              >
                Remove
              </Button>
              <Button
                sx={{
                  bgcolor: "#57575780",
                  color: "white",
                  width: "130px",
                  ":hover": {
                    bgcolor: "#44444480",
                  },
                }}
                onClick={() => setIsDeleteNotifications(false)}
              >
                Close
              </Button>
            </Box>
          </Box>
        </Box>
      )}
    </FlexBetween>
  );
};

export default Navbar;
