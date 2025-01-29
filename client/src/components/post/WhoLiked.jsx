/* eslint-disable react/prop-types */
import { Box, useMediaQuery } from "@mui/system";
import FlexBetween from "./../FlexBetween";
import UserImage from "./../UserImage";
import { Divider, IconButton, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";
import { CloseOutlined, VerifiedOutlined } from "@mui/icons-material";

const WhoLiked = ({ likesLoding, likeList, setShowLikes, setLikeList }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const { palette } = useTheme();

  return (
    <Box
      position="fixed"
      width="100%"
      height="100%"
      top="0"
      left="0"
      display="flex"
      alignItems="center"
      zIndex="111111111"
      justifyContent="center"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        onClick={() => {
          setShowLikes(false);
          setLikeList([]);
        }}
        bgcolor="#00000066"
      ></Box>

      <Box
        bgcolor={palette.neutral.light}
        p="10px 28px"
        width={isNonMobileScreens ? "500px" : "100%"}
        display="flex"
        flexDirection="column"
        gap="14px"
        minHeight="460px"
        position="relative"
        sx={{
          maxWidth: "100%",
          zIndex: "1",
          maxHeight: isNonMobileScreens ? "700px" : "312px",
          overflow: "auto",
          borderRadius: isNonMobileScreens ? "0.75rem" : "0",
        }}
      >
        <IconButton
          onClick={() => setShowLikes(false)}
          sx={{ position: "absolute", right: "15px", zIndex: "11" }}
        >
          <CloseOutlined />
        </IconButton>
        {!likesLoding ? (
          <Box
            position="absolute"
            top="38%"
            left="50%"
            sx={{ transform: "translate(-50%)" }}
          >
            <Box
              className="loadingAnimation"
              width="80px"
              height="80px"
              m="10px auto"
            ></Box>
          </Box>
        ) : likeList.length < 1 ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            width="100%"
            height="100%"
            position="absolute"
            top="50%"
            left="50%"
            sx={{
              transform: "translate(-50%,-50%)",
            }}
          >
            <Typography fontSize="25px">There are no likes yet</Typography>
          </Box>
        ) : (
          likeList?.map((user, index) => {
            if (user._id === undefined) {
              return;
            }

            return (
              <>
                <Link to={`/profile/${user._id}`} className="opacityBox">
                  <FlexBetween key={index} sx={{ cursor: "pointer" }}>
                    <Box display="flex" alignItems="center" gap="10px">
                      <UserImage image={user.picturePath} />
                      <Box display="flex" alignItems="center" gap="4px">
                        <Typography>
                          {user.firstName || "Undefined"} {user.lastName}
                        </Typography>
                        {user.verified && (
                          <VerifiedOutlined
                            sx={{
                              fontSize: "20px",
                              color: "#00D5FA",
                            }}
                          />
                        )}
                      </Box>
                    </Box>
                  </FlexBetween>
                </Link>
                {likeList?.indexOf(user) !== likeList?.length - 1 && (
                  <Divider />
                )}
              </>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default WhoLiked;
