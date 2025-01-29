/* eslint-disable react/prop-types */
import {
  Close,
  DarkMode,
  LightMode,
  People,
  Person2,
  Menu,
  ChatSharp,
  Notifications,
  Home,
} from "@mui/icons-material";
import {
  Button,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import { setFriendsRequest, setLogout, setMode } from "../../../state";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTheme } from "@emotion/react";
import { useEffect, useState } from "react";
import FriendsRequest from "../widgets/FriendsRequest";
import socket from "../../components/socket";
import NotificationData from "../widgets/NotificationData";

const ChatNavbar = ({
  setOpenChats,
  isMobileMenuToggled,
  setIsMobileMenuToggled,
  chatHistoryData,
  userParam,
}) => {
  const [openRequests, setOpenRequests] = useState(false);
  const [friendsRequestData, setFriendRequestData] = useState([]);
  const [isNotification, setIsNotification] = useState(false);
  const [notificationsState, setNotificationsState] = useState(null);
  const [watchedNotifications, setWatchedNotifications] = useState(null);
  const [isDeleteNotifications, setIsDeleteNotifications] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const user = useSelector((state) => state.user);
  const mode = useSelector((state) => state.mode);
  const token = useSelector((state) => state.token);

  const dispatch = useDispatch();

  const theme = useTheme();
  const neutrallLight = theme.palette.neutral.light;
  const background = theme.palette.background.default;

  const fullName = `${user?.firstName} ${user?.lastName}`;

  const friendsRequest = async () => {
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
    }
  };

  const getNotifications = async () => {
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
      setNotificationsState(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    friendsRequest();
    getNotifications();
  }, []);

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

  return (
    <Box position="relative" zIndex="1">
      <Box
        bgcolor={mode === "dark" ? "#a09265" : "#F6F6F6"}
        sx={{
          width: "100%",
          position: "fixed",
          top: "0",
          p: "3px 15px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "3px",
        }}
      >
        <Box display="flex" justifyContent="space-between" width="100%">
          <IconButton
            onClick={() => setOpenChats((prev) => !prev)}
            sx={{ color: "rgba(0, 0, 0, 0.54)" }}
          >
            <ChatSharp />
          </IconButton>

          <Typography
            height="fit-content"
            alignSelf="center"
            sx={{ userSelect: "none" }}
          >
            {chatHistoryData[userParam]?.userInfo?.firstName}{" "}
            {chatHistoryData[userParam]?.userInfo?.lastName}
          </Typography>

          <IconButton
            onClick={() => setIsMobileMenuToggled(true)}
            sx={{ color: "rgba(0, 0, 0, 0.54)" }}
          >
            <Menu />
          </IconButton>
        </Box>
      </Box>

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
        zIndex="1110"
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
          <Link to="/" onClick={() => setIsMobileMenuToggled(false)}>
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer", userSelect: "none" }}
            >
              <IconButton sx={{ position: "relative" }}>
                <Home sx={{ fontSize: "25px" }} />
              </IconButton>

              <Typography>Home Page</Typography>
            </Box>
          </Link>

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
              <MenuItem value="Log out" onClick={() => dispatch(setLogout())}>
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
        </Box>
      </Box>

      {openRequests && (
        <FriendsRequest
          openRequests={openRequests}
          setOpenRequests={setOpenRequests}
          setIsMobileMenuToggled={setIsMobileMenuToggled}
          friendsRequestData={friendsRequestData}
          setFriendRequestData={setFriendRequestData}
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
          zIndex="111111"
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
    </Box>
  );
};

export default ChatNavbar;
