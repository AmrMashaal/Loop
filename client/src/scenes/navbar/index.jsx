import FlexBetween from "../../components/FlexBetween";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Typography,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  useMediaQuery,
  Button,
} from "@mui/material";
import {
  Search,
  DarkMode,
  LightMode,
  Menu,
  Close,
  People,
  Person2,
  Message,
  Notifications,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { setMode, setLogout, setFriendsRequest } from "../../../state/index";
import { Link, useNavigate } from "react-router-dom";
import FriendsRequest from "../widgets/FriendsRequest";
import NotificationData from "../widgets/NotificationData";
import socket from "../../components/socket";
import { setIsOverFlow } from "../../App";

// eslint-disable-next-line react/prop-types
const Navbar = ({ isProfile }) => {
  const [isMobileMenuToggled, setIsMobileMenuToggled] = useState(false);
  const [openRequests, setOpenRequests] = useState(false);
  const [isSearch, setIsSearch] = useState(false);
  const [isNotification, setIsNotification] = useState(false);
  const [isDeleteNotifications, setIsDeleteNotifications] = useState(false);
  const [returnNavColor, setReturnNavColor] = useState(true);
  const [requestLoading, setRequestLoading] = useState(true);
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
  const background = theme.palette.background.default;
  const alt = theme.palette.background.alt;
  const fullName = `${user?.firstName} ${user?.lastName}`;

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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
    }
  };

  const getMoreNotifications = () => {
    setPageNumber((prev) => prev + 1);
  };

  useEffect(() => {
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
    };
  }, []);

  useEffect(() => {
    if (openRequests) {
      friendsRequest();
    }
  }, [openRequests]);

  useEffect(() => {
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
    if (!isNonMobileScreens) {
      if (isMobileMenuToggled) {
        setIsOverFlow(true);
      } else {
        setIsOverFlow(false);
      }
    }
  }, [isMobileMenuToggled, mode]);

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
      console.log(error);
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
            src="\public\assets\logoSInArrow.png"
            alt="loop-icon"
            width={isNonMobileScreens ? "50" : "40"}
            style={{ pointerEvents: "none" }}
          />
          <img
            src="\public\assets\arrow.png"
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

          <FormControl variant="standard" value={fullName}>
            <Select
              value={fullName}
              sx={{
                background:
                  isProfile && returnNavColor && mode === "light"
                    ? "#f0f0f0b3"
                    : isProfile && returnNavColor && mode === "dark"
                    ? "#33333391"
                    : neutrallLight,
                padding: "2px 8px",
                width: "150px",
                borderRadius: "9px",
                "& .MuiSvgIcon-root": {
                  width: "20px",
                },
                "& .MuiSelect-select": {
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                },
                "& .MuiSelect-select:focus": {
                  backgroundColor: neutrallLight,
                },
              }}
              input={<InputBase />}
            >
              <MenuItem
                value={fullName}
                sx={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                {fullName}
              </MenuItem>
              <MenuItem
                value="Log out"
                onClick={() => {
                  dispatch(setLogout()), disconnectSocket();
                }}
              >
                Log out
              </MenuItem>
            </Select>
          </FormControl>
        </FlexBetween>
      ) : (
        <Box display="flex" gap="10px">
          <IconButton
            onClick={() => setIsSearch(true)}
            sx={{
              bgcolor:
                isProfile && returnNavColor && mode === "light"
                  ? "#F0F0F0"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
            }}
          >
            <Search />
          </IconButton>
          <IconButton
            onClick={() => setIsMobileMenuToggled(true)}
            sx={{
              bgcolor:
                isProfile && returnNavColor && mode === "light"
                  ? "#F0F0F0"
                  : isProfile && returnNavColor && mode === "dark"
                  ? "#33333391"
                  : undefined,
            }}
          >
            <Menu />
          </IconButton>
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

          {isMobileMenuToggled && (
            <Box
              width="100%"
              height="100%"
              position="fixed"
              left="0"
              top="0"
              zIndex="9"
              sx={{
                backgroundColor: "#00000059",
              }}
              onClick={() => setIsMobileMenuToggled(false)}
            ></Box>
          )}

          <Box
            position="fixed"
            maxWidth="500px"
            minWidth="200px"
            padding="10px"
            height="100%"
            zIndex="10"
            backgroundColor={background}
            right={isMobileMenuToggled ? "0" : "-400px"}
            top="0"
            boxShadow="6px 2px 20px 0 #0000002d"
            sx={{
              transition: ".3s right",
            }}
          >
            <IconButton onClick={() => setIsMobileMenuToggled(false)}>
              <Close />
            </IconButton>

            <Box
              display="flex"
              flexDirection="column"
              justifyContent="center"
              gap="20px"
              marginTop="14px"
            >
              <Link
                to={`/profile/${user._id}`}
                onClick={() => setIsMobileMenuToggled(false)}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  <IconButton sx={{ position: "relative" }}>
                    <Person2 sx={{ fontSize: "25px" }} />
                  </IconButton>

                  <Typography>Profile Page</Typography>
                </Box>
              </Link>

              <Link to="/chat">
                <Box
                  display="flex"
                  alignItems="center"
                  sx={{ cursor: "pointer", userSelect: "none" }}
                >
                  <IconButton sx={{ position: "relative" }}>
                    <Message sx={{ fontSize: "25px" }} />
                  </IconButton>

                  <Typography>Messages</Typography>
                </Box>
              </Link>

              <Box
                display="flex"
                alignItems="center"
                sx={{ cursor: "pointer", userSelect: "none" }}
                onClick={() => setOpenRequests(true)}
              >
                <IconButton sx={{ position: "relative" }}>
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
                <Typography>Friends Request</Typography>
              </Box>

              <Box
                display="flex"
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

                <Typography>Notifications</Typography>
              </Box>

              <FormControl variant="standard" value={fullName}>
                <Select
                  value={fullName}
                  sx={{
                    background: neutrallLight,
                    padding: "2px 8px",
                    width: "150px",
                    "& .MuiSvgIcon-root": {
                      width: "20px",
                    },
                    "& .MuiSelect-select": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "block",
                    },
                    "& .MuiSelect-select:focus": {
                      backgroundColor: neutrallLight,
                    },
                  }}
                  input={<InputBase />}
                >
                  <MenuItem
                    value={fullName}
                    sx={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    {fullName}
                  </MenuItem>
                  <MenuItem
                    value="Log out"
                    onClick={() => {
                      dispatch(setLogout()), disconnectSocket();
                    }}
                  >
                    Log out
                  </MenuItem>
                </Select>
              </FormControl>

              <Box
                p="3px"
                width="130px"
                height="36px"
                mr="10px"
                bgcolor={neutrallLight}
                borderRadius="50px"
                position="relative"
                boxShadow="inset -1px 2px 3px 2px #00000045"
                outline={`${neutrallLight} solid 5px`}
                alignSelf="center"
                sx={{ cursor: "pointer" }}
                onClick={() => dispatch(setMode())}
              >
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    transform: "translateY(-50%)",
                    backgroundColor:
                      mode === "dark" ? "#3e3e3e" : neutrallLight,
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
            </Box>
          </Box>
        </>
      )}

      {openRequests && (
        <FriendsRequest
          openRequests={openRequests}
          setOpenRequests={setOpenRequests}
          setIsMobileMenuToggled={setIsMobileMenuToggled}
          friendsRequestData={friendsRequestData}
          setFriendRequestData={setFriendRequestData}
          requestLoading={requestLoading}
        />
      )}

      {isNotification && !isDeleteNotifications && (
        <NotificationData
          openNotification={isNotification}
          setIsMobileMenuToggled={setIsMobileMenuToggled}
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
