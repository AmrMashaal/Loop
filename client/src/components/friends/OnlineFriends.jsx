/* eslint-disable react/prop-types */
import {
  Box,
  Typography,
  Divider,
  useMediaQuery,
  IconButton,
} from "@mui/material";
import { Link } from "react-router-dom";
import UserImage from "../UserImage";
import FlexBetween from "../FlexBetween";
import { useSelector } from "react-redux";
import ProfileFriendsSkeleton from "../../scenes/skeleton/ProfileFriendsSkeleton";
import { useEffect, useRef } from "react";
import { MessageOutlined, VerifiedOutlined } from "@mui/icons-material";

const OnlineFriends = ({ navFriends, loading, setPage }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const user = useSelector((state) => state.user);

  const parentRef = useRef(null);

  useEffect(() => {
    const div = parentRef.current;

    const handleScroll = () => {
      if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
        setPage((prev) => prev + 1);
      }
    };

    div.addEventListener("scroll", handleScroll);

    return () => {
      div.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box
      mt="10px"
      height="82vh"
      overflow="hidden"
      sx={{
        scrollbarWidth: "3px",
        ":hover": {
          overflowY: "auto",
        },
      }}
      display={!isNonMobileScreens ? "flex" : "block"}
      flexDirection={isNonMobileScreens ? "column" : "row"}
      gap={!isNonMobileScreens ? "25px" : undefined}
      mb={isNonMobileScreens ? undefined : "-15px"}
      p="3px 5px 14px"
      ref={parentRef}
    >
      {loading && <ProfileFriendsSkeleton />}

      {!loading &&
        (navFriends?.friends?.length !== 0 ? (
          navFriends?.friends?.map((fr, index) => {
            if (
              fr?.sender?._id === undefined ||
              fr?.receiver?._id === undefined
            ) {
              return;
            }

            const friend =
              fr?.sender?._id === user?._id ? fr?.receiver : fr?.sender;

            return (
              <Box key={index} mb="15px">
                <Link to={`/profile/${friend?._id}`}>
                  <FlexBetween
                    pb="8px"
                    sx={{
                      cursor: "pointer",
                      ":hover": {
                        ".usernameFriends": {
                          marginLeft: isNonMobileScreens ? "6px" : undefined,
                        },
                      },
                    }}
                  >
                    <Box
                      display="flex"
                      gap="12px"
                      alignItems="center"
                      flexDirection={isNonMobileScreens ? "row" : "column"}
                      className={isNonMobileScreens ? undefined : "opacityBox"}
                    >
                      <UserImage
                        image={friend?.picturePath}
                        size={isNonMobileScreens ? "55px" : "55px"}
                      />
                      <Box>
                        <Box display="flex" gap="5px">
                          <Typography
                            fontSize={isNonMobileScreens ? "14px" : "10px"}
                            sx={{ transition: ".3s" }}
                            className="usernameFriends"
                            maxWidth="115px"
                            overflow="hidden"
                            textOverflow="ellipsis"
                            whiteSpace="nowrap"
                            mt={!isNonMobileScreens && "-6px"}
                          >
                            {friend?.firstName} {friend?.lastName}
                          </Typography>

                          {friend?.verified && (
                            <VerifiedOutlined
                              sx={{
                                fontSize: "20px",
                                color: "#15a1ed",
                              }}
                            />
                          )}
                        </Box>

                        <Typography
                          color="#858585"
                          whiteSpace="nowrap"
                          maxWidth="115px"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          fontSize="12px"
                          display="flex"
                          alignItems="center"
                        >
                          <Typography sx={{ userSelect: "none" }}>@</Typography>
                          {friend?.username}
                        </Typography>
                      </Box>
                    </Box>

                    <Link to={`/chat/${friend?._id}`}>
                      <IconButton>
                        <MessageOutlined
                          sx={{
                            fontSize: "20px",
                            color: "#858585",
                          }}
                        />
                      </IconButton>
                    </Link>
                  </FlexBetween>
                </Link>

                {isNonMobileScreens &&
                  navFriends?.friends?.indexOf(fr) !==
                    navFriends?.friends?.length - 1 && <Divider />}
              </Box>
            );
          })
        ) : (
          <Box width="100%">
            <Typography
              my="5px"
              whiteSpace="nowrap"
              fontWeight="500"
              fontSize="15px"
              color="gray"
              sx={{ userSelect: "none" }}
            >
              You have no friends yet
            </Typography>
          </Box>
        ))}
    </Box>
  );
};

export default OnlineFriends;
