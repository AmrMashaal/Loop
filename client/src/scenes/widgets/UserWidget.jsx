/* eslint-disable react/prop-types */
/* eslint-disable react/no-unescaped-entities */
import {
  LocationOnOutlined,
  WorkOutlineOutlined,
  VerifiedOutlined,
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
import WidgetWrapper from "../../components/WidgetWrapper";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const UserWidget = ({ userId, picturePath }) => {
  const [theUser, setTheUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);
  
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  
  const { palette } = useTheme();
  const medium = palette.neutral.medium;

  const getUser = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      setTheUser(data);
    } catch (error) {
      console.log(error);
    } finally {
      setUserLoading(false);
    }
  };

  useEffect(() => {
    getUser();
  }, []);

  return (
    <>
      <WidgetWrapper position="sticky" top="87px" overflow="hidden">
        {!userLoading ? (
          <>
            <Link to={`/profile/${userId}`}>
              {user.background ? (
                <img
                  src={`${import.meta.env.VITE_API_URL}/assets/${
                    user.background
                  }`}
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
                    background: "beige",
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
                <UserImage image={picturePath} size="70"></UserImage>
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

            <Divider />

            <Box p="1rem 0" zIndex="2" position="relative">
              <Box
                display="flex"
                alignItems="center"
                gap="10px"
                marginBlock="1rem"
              >
                <LocationOnOutlined style={{ fontSize: "26px" }} />
                <Typography
                  color={medium}
                  textTransform="capitalize"
                  fontSize="14px"
                >
                  {theUser?.location}
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap="10px">
                <WorkOutlineOutlined style={{ fontSize: "26px" }} />
                <Typography
                  color={medium}
                  textTransform="capitalize"
                  fontSize="14px"
                >
                  {theUser?.occupation}
                </Typography>
              </Box>
            </Box>

            <Divider />

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
      </WidgetWrapper>
    </>
  );
};

export default UserWidget;
