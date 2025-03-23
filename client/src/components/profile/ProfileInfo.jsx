/* eslint-disable react/prop-types */
import { Box, useMediaQuery } from "@mui/system";
import {
  Add,
  HourglassBottom,
  Message,
  NotificationAdd,
  Notifications,
  People,
  VerifiedOutlined,
  WorkOutlineOutlined,
} from "@mui/icons-material";
import { Button, Skeleton, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import UserImage from "../UserImage";
import ProfileSettings from "./ProfileSettings";
import OpenPhoto from "../OpenPhoto";
import DeleteComponent from "../post/DeleteComponent";
import { setFriends } from "../../../state";
import ChangePassword from "./ChangePassword";
import { setIsOverFlow } from "../../App";

const ProfileInfo = ({ userInfo, userId }) => {
  const [profileSettings, setProfileSettings] = useState(false);
  const [isImgOpen, setIsImagOpen] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [changePassword, setChangePassword] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [isFriendSettings, setIsFriendSettings] = useState(false);
  const [isFollower, setIsFollower] = useState(false);
  const [friendship, setFriendship] = useState({});
  const [friendSettings, setFriendSettings] = useState("");
  const [img, setImg] = useState("");

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const mode = useSelector((state) => state.mode);

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const theme = useTheme();
  const medium = theme.palette.neutral.medium;
  const alt = theme.palette.background.alt;

  const dispatch = useDispatch();

  useEffect(() => {
    if (isImgOpen) {
      setIsOverFlow(true);
    } else {
      setIsOverFlow(false);
    }
  }, [isImgOpen]);

  // useEffect(() => {
  //   setWaitingFriendRequest(userInfo?.friendsRequest);
  // }, [userInfo]);

  const handleRemoveFriend = async () => {
    try {
      const response = await fetch(`/api/friends/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok) {
        dispatch(setFriends({ friends: data }));

        setFriendSettings("not a friend");

        setFriendship(data);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const acceptRequest = async () => {
    try {
      const response = await fetch(`/api/friends/${userId}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const friends = await response.json();
        setFriendship(friends);

        setFriendSettings("friends");
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const addFriend = async () => {
    setAddLoading(true);

    try {
      const response = await fetch(`/api/friends/${userInfo?._id}/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setFriendship(data);

      setFriendSettings("pending");
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setAddLoading(false);
    }
  };

  const friendshipStatus = async () => {
    try {
      const response = await fetch(`/api/friends/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setFriendship(data);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  const followStatus = async () => {
    try {
      const response = await fetch(`/api/follow/${userId}/isFollower`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setIsFollower(data);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    if (userInfo?._id !== user?._id && userId !== user?._id) {
      friendshipStatus();
      followStatus();
    }
  }, [userInfo, userId]);

  const handleTriangle = () => {
    (friendSettings === "remove" ||
      (friendship?.status === "pending" &&
        friendship?.sender?._id === user._id)) &&
      setIsDelete(true),
      // -----------------------------------
      friendSettings === "accept" &&
        user._id === friendship?.receiver?._id &&
        acceptRequest();
    // -----------------------------------
    friendSettings === "add" && addFriend();
  };

  document.addEventListener("click", (event) => {
    const buttonId = document.getElementById("addRemoveFriendId");
    if (!buttonId.contains(event.target)) {
      setIsFriendSettings(false);
    }
  });

  const handleStatus = () => {
    if (
      friendship?.status === "pending" &&
      friendship?.sender?._id === user._id
    ) {
      return "Pending";
    } else if (
      friendship?.status === "pending" &&
      friendship?.receiver?._id === user._id
    ) {
      return "Accept";
    } else if (friendship?.status === "accepted") {
      return "Friends";
    } else if (friendship?.status === "not a friend") {
      return "Add Friend";
    } else if (!friendship?.status) {
      return "Loading...";
    }
  };

  const handleFollow = async () => {
    try {
      const response = await fetch(`/api/follow/${userInfo?._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setIsFollower(data ? true : false);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  return (
    <Box position="relative" sx={{ maxHeight: "395px" }}>
      {userInfo?.background ? (
        <img
          onClick={() => {
            setIsImagOpen(true),
              setImg(
                userInfo?._id === user._id
                  ? user.background
                  : userInfo?.background
              );
          }}
          width="100%"
          src={
            userInfo?._id === user._id ? user.background : userInfo?.background
          }
          style={{
            height: "300px",
            maxWidth: "100%",
            objectFit: "cover",
            cursor: "pointer",
          }}
        />
      ) : (
        <Box
          height="300px"
          sx={{
            background: userInfo?.background ? undefined : "beige",
          }}
        ></Box>
      )}

      <Box
        display="flex"
        justifyContent="space-between"
        className={isNonMobileScreens ? "profileContainer" : ""}
        mb="40px"
      >
        <Box
          position="relative"
          bottom="111px"
          display={isNonMobileScreens ? "flex" : undefined}
          gap="10px"
          left={isNonMobileScreens ? "22px" : "50%"}
          width={isNonMobileScreens ? undefined : "fit-content"}
          height="0px"
          sx={{
            transform: isNonMobileScreens ? undefined : "translateX(-50%)",
          }}
        >
          {userInfo ? (
            <Box
              width="fit-content"
              margin="auto"
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setIsImagOpen(true),
                  setImg(
                    userInfo?._id === user._id
                      ? user.picturePath
                      : userInfo?.picturePath
                  );
              }}
            >
              <UserImage
                image={
                  userInfo?._id === user._id
                    ? user.picturePath
                    : userInfo?.picturePath
                }
                size="200px"
                isProfile={true}
                isOnline={userInfo?.online}
              />
            </Box>
          ) : (
            <Box
              width="200px"
              height="200px"
              bgcolor="gray"
              borderRadius="50%"
              sx={{
                border: `6px solid ${alt}`,
                boxShadow: "rgba(0, 0, 0, 0.13) 3px 6px 7px 0px",
                margin: isNonMobileScreens ? undefined : "auto",
              }}
            ></Box>
          )}

          <Box
            position="relative"
            top={isNonMobileScreens ? "108px" : "0"}
            height="fit-content"
            textAlign={isNonMobileScreens ? undefined : "center"}
          >
            {userInfo ? (
              <>
                <Box
                  position="relative"
                  width="fit-content"
                  margin={isNonMobileScreens ? undefined : "7px auto 0"}
                >
                  <Typography
                    fontSize={isNonMobileScreens ? "35px" : "28px"}
                    fontWeight="500"
                    maxWidth={isNonMobileScreens ? undefined : "250px"}
                    className={userInfo?.verified && "loopAnimation"}
                    lineHeight={isNonMobileScreens ? "50px" : "30px"}
                  >
                    {userInfo?._id === user._id
                      ? user.firstName
                      : userInfo?.firstName}{" "}
                    {userInfo?._id === user._id
                      ? user.lastName
                      : userInfo?.lastName}
                  </Typography>
                  {userInfo.verified && (
                    <Tooltip arrow placement="top" title="Verified Account">
                      <VerifiedOutlined
                        sx={{
                          fontSize: "32px",
                          color: "#00D5FA",
                          position: "absolute",
                          right: isNonMobileScreens ? "-40px" : "-39px",
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                <Typography
                  color={mode === "light" ? "#5c5c5c" : "#c1c1c1"}
                  fontSize="17px"
                  m="5px 0 -6px"
                >
                  <span style={{ userSelect: "none" }}>@</span>
                  {userInfo?._id === user._id
                    ? user.username
                    : userInfo?.username}
                </Typography>

                <Box
                  display="flex"
                  gap={isNonMobileScreens ? "20px" : "4px"}
                  mt="9px"
                  flexDirection={isNonMobileScreens ? "row" : "column"}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="6px"
                    color={medium}
                    justifyContent={isNonMobileScreens ? undefined : "center"}
                  >
                    <WorkOutlineOutlined />
                    <Typography fontSize="17px">
                      {userInfo?._id === user._id
                        ? user.occupation
                        : userInfo?.occupation}
                    </Typography>
                  </Box>
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent={isNonMobileScreens ? "flex-start" : "center"}
                  gap="10px"
                  mt="5px"
                  mb="-5px"
                  color={medium}
                  sx={{ userSelect: "none" }}
                >
                  <Typography>
                    {userInfo?.followersCount} follower
                    {userInfo?.followersCount > 1 ? "s" : ""}
                  </Typography>
                  -<Typography>{userInfo?.followingCount} following</Typography>
                </Box>

                <Typography
                  color={mode === "light" ? "#5c5c5c" : "#c1c1c1"}
                  maxWidth="550px"
                  px="20px"
                  m="15px 0 5px"
                  sx={{ wordBreak: "break-word" }}
                >
                  {userInfo?.bio && userInfo?.bio}
                </Typography>

                {user._id === userId || user.username === userId ? (
                  <Button
                    sx={{
                      height: "100%",
                      whiteSpace: "nowrap",
                      marginTop: userInfo?.bio.length ? "12px" : "0",
                      padding: "5px 23px",
                      border: "2px solid",
                      fontWeight: "500",
                      textTransform: "capitalize",
                      fontSize: "14px",
                      borderRadius: "20px",
                      color: mode === "light" ? "#5c5c5c" : "#c1c1c1",
                    }}
                    onClick={() => setProfileSettings(true)}
                  >
                    Settings
                  </Button>
                ) : (
                  <Box
                    position="relative"
                    width="fit-content"
                    display="flex"
                    alignItems="center"
                    gap="10px"
                    flexWrap="wrap"
                    justifyContent="center"
                    m={isNonMobileScreens ? undefined : "auto"}
                  >
                    {/* ----------------Friend Status button---------------- */}
                    <Button
                      id="addRemoveFriendId"
                      sx={{
                        height: "100%",
                        whiteSpace: "nowrap",
                        marginTop: userInfo?.bio.length ? "12px" : "0",
                        padding: "5px 23px",
                        border: "2px solid",
                        fontWeight: "600",
                        textTransform: "capitalize",
                        fontSize: "14px",
                        borderRadius: "20px",
                        color:
                          friendship?.status === "accepted"
                            ? undefined
                            : mode === "light"
                            ? "#5c5c5c"
                            : "#c1c1c1",
                      }}
                      onClick={() => {
                        setIsFriendSettings(!isFriendSettings);
                        if (
                          friendship?.status === "not a friend" &&
                          !addLoading
                        ) {
                          setFriendSettings("add");
                        } else if (
                          friendship?.status === "pending" &&
                          friendship?.receiver?._id === user._id
                        ) {
                          setFriendSettings("accept");
                        } else if (
                          friendship?.status === "pending" &&
                          friendship?.sender?._id === user._id
                        ) {
                          setFriendSettings("remove");
                        } else if (friendship?.status === "accepted") {
                          setFriendSettings("remove");
                        }
                      }}
                    >
                      {friendship?.status &&
                        (friendship?.status === "accepted" ? (
                          <People />
                        ) : friendship?.status === "pending" ? (
                          <HourglassBottom />
                        ) : (
                          <Add />
                        ))}

                      <Typography fontWeight="600" ml="3px">
                        {handleStatus()}
                      </Typography>
                    </Button>

                    {userInfo?._id !== user._id && (
                      <Button
                        id="addRemoveFriendId"
                        sx={{
                          height: "100%",
                          whiteSpace: "nowrap",
                          marginTop: userInfo?.bio.length ? "12px" : "0",
                          padding: "5px 23px",
                          border: "2px solid",
                          textTransform: "capitalize",
                          fontSize: "14px",
                          borderRadius: "20px",
                          color: isFollower
                            ? undefined
                            : mode === "light"
                            ? "#5c5c5c"
                            : "#c1c1c1",
                        }}
                        onClick={handleFollow}
                      >
                        {isFollower ? <Notifications /> : <NotificationAdd />}

                        <Typography fontWeight="600" ml="4px">
                          {isFollower ? "Unfollow" : "Follow"}
                        </Typography>
                      </Button>
                    )}

                    {userInfo?._id !== user._id && (
                      <Link to={`/chat/${userInfo._id}`}>
                        <Button
                          sx={{
                            height: "100%",
                            whiteSpace: "nowrap",
                            marginTop: userInfo?.bio.length ? "12px" : "0",
                            padding: "5px 23px",
                            border: "2px solid",
                            textTransform: "capitalize",
                            fontSize: "14px",
                            borderRadius: "20px",
                            color: mode === "light" ? "#5c5c5c" : "#c1c1c1",
                            width: "113px",
                          }}
                        >
                          <Message />

                          <Typography fontWeight="600" ml="7px">
                            Chat
                          </Typography>
                        </Button>
                      </Link>
                    )}

                    {isFriendSettings && (
                      <Button
                        sx={{
                          zIndex: "1",
                          borderRadius: "0.75rem",
                          fontSize: "14px",
                          left: "29px",
                          bottom: isNonMobileScreens ? "-53px" : undefined,
                          top: isNonMobileScreens ? undefined : "-60px",
                          p: "10px 20px",
                          position: "absolute",
                          bgcolor: "#44444480",
                          color: "white",
                          cursor: "pointer",
                          userSelect: "none",
                          ":hover": {
                            bgcolor: "#57575780",
                            ":after": {
                              borderBottom: isNonMobileScreens
                                ? "10px solid #57575780"
                                : undefined,
                              borderTop: isNonMobileScreens
                                ? undefined
                                : "10px solid #57575780",
                            },
                          },
                          ":before": {
                            content: "''",
                            borderTop: `10px solid ${
                              friendSettings === "remove" ? "red" : "green"
                            }`,
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderBottom: "none",
                            mr: "3px",
                          },
                          ":after": {
                            content: "''",
                            borderBottom: isNonMobileScreens
                              ? "10px solid #44444480"
                              : "none",
                            borderLeft: "5px solid transparent",
                            borderRight: "5px solid transparent",
                            borderTop: isNonMobileScreens
                              ? "none"
                              : "10px solid #44444480",
                            position: "absolute",
                            top: isNonMobileScreens ? "-9.8px" : "44px",
                            left: "14px",
                            transition: ".3s",
                          },
                        }}
                        onClick={handleTriangle}
                      >
                        {friendSettings}
                      </Button>
                    )}
                  </Box>
                )}
              </>
            ) : (
              <>
                <Skeleton width="230px" sx={{ mt: "10px", py: "6px" }} />
                <Skeleton
                  width="200px"
                  sx={{ margin: isNonMobileScreens ? undefined : "auto" }}
                />
                <Skeleton
                  width="150px"
                  sx={{ margin: isNonMobileScreens ? undefined : "auto" }}
                />
              </>
            )}
          </Box>
        </Box>
      </Box>

      {profileSettings && (
        <ProfileSettings
          setProfileSettings={setProfileSettings}
          setChangePassword={setChangePassword}
        />
      )}

      {changePassword && (
        <ChangePassword
          changePassword={changePassword}
          setChangePassword={setChangePassword}
        />
      )}

      {isImgOpen && <OpenPhoto photo={img} setIsImagOpen={setIsImagOpen} />}

      {isDelete && (
        <DeleteComponent
          setIsDelete={setIsDelete}
          type="removeFriend"
          handleRemoveFriend={handleRemoveFriend}
        />
      )}
    </Box>
  );
};

export default ProfileInfo;
