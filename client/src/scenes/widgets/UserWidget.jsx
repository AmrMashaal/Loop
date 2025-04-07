/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import {
  LocationOnOutlined,
  WorkOutlineOutlined,
  VerifiedOutlined,
  PersonOutline,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  Divider,
  useTheme,
  Skeleton,
  Button,
} from "@mui/material";
import UserImage from "../../components/UserImage";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatLikesCount } from "../../frequentFunctions";

const UserWidget = ({ userId, picturePath }) => {
  const [theUser, setTheUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const { palette } = useTheme();
  const medium = palette.neutral.medium;

  const getUser = async () => {
    if (userId) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        setTheUser(data);
      } catch (error) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", error);
        }
      } finally {
        setUserLoading(false);
      }
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <Box
        p="14px 25px"
        position="sticky"
        top="80px"
        overflow="hidden"
        height="100vh"
      >
        {!userLoading ? (
          <>
            <Link to={`/profile/${userId}`}>
              {user.background ? (
                <img
                  src={user.background}
                  alt=""
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "80px",
                    objectFit: "cover",
                    zIndex: "2",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              ) : (
                <Box
                  style={{
                    position: "absolute",
                    top: "0",
                    left: "0",
                    width: "100%",
                    height: "80px",
                    objectFit: "cover",
                    zIndex: "2",
                    pointerEvents: "none",
                    userSelect: "none",
                    background: "#a89090",
                  }}
                ></Box>
              )}

              <Box
                position="absolute"
                top="30px"
                left="50%"
                borderRadius="50%"
                sx={{ transform: "translateX(-50%)", zIndex: "3" }}
              >
                <UserImage image={picturePath} size="70" isOnline={true}></UserImage>
              </Box>

              <Box position="relative">
                <Box textAlign="center">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="3px"
                    mt="97px"
                    justifyContent="center"
                  >
                    <Typography
                      fontSize="20px"
                      lineHeight="1.5rem"
                      className={theUser?.verified && "loopAnimation"}
                      fontWeight={theUser?.verified ? "bold" : "500"}
                    >
                      {theUser?.firstName} {theUser?.lastName}
                    </Typography>
                    {theUser?.verified && (
                      <VerifiedOutlined
                        sx={{ color: "#15a1ed", fontSize: "20px" }}
                      />
                    )}
                  </Box>

                  <Typography fontSize="13px" mb="10px" color={medium}>
                    @{theUser?.username}
                  </Typography>
                </Box>
              </Box>
            </Link>

            <Box
              p="1rem 0"
              zIndex="2"
              position="relative"
              alignItems="center"
              justifyContent="center"
              display="flex"
              sx={{ userSelect: "none" }}
            >
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                p={"0 1rem"}
                borderRight={`1px solid ${medium}`}
              >
                <Typography fontSize="20px" fontWeight="bold">
                  {formatLikesCount(theUser?.followersCount)}
                </Typography>

                <Typography fontSize="13px" fontWeight="bold">
                  Follower
                  {theUser?.followersCount > 1 && "s"}
                </Typography>
              </Box>

              <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                p={"0 1rem"}
              >
                <Typography fontSize="20px" fontWeight="bold">
                  {formatLikesCount(theUser?.followingCount)}
                </Typography>

                <Typography fontSize="13px" fontWeight="bold">
                  Following
                  {theUser?.followingCount > 1 && "s"}
                </Typography>
              </Box>
            </Box>

            <Link to={`/profile/${user._id}`}>
              <Button sx={{ mt: "1rem", mx: "auto", width: "100%" }}>
                My Profile
              </Button>
            </Link>
          </>
        ) : (
          <Box>
            <Box display="flex" gap="18px" alignItems="center">
              <Skeleton
                width="50px"
                height="80px"
                sx={{ borderRadius: "50%" }}
              />
              <Box>
                <Skeleton width="150px" />
                <Skeleton width="76px" />
              </Box>
            </Box>

            <Divider sx={{ my: "8px" }} />
            <Skeleton width="250px" />
            <Skeleton width="230px" />
          </Box>
        )}
      </Box>
    </>
  );
};

export default UserWidget;
