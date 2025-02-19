/* eslint-disable react/prop-types */
import { ChatSharp } from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";

const ChatNavbar = ({ setOpenChats, lastMessageData, userParam,fromNav }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const navigate = useNavigate();

  return (
    <Box position="relative" zIndex="1" color="white">
      <Box
        bgcolor="#20232d"
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
        <Box display="flex" alignItems="center" width="100%">
          {!isNonMobileScreens && !fromNav && (
            <Link to="/chat">
              <IconButton
                onClick={() => setOpenChats((prev) => !prev)}
                sx={{ color: "white" }}
              >
                <ChatSharp />
              </IconButton>
            </Link>
          )}

          <Typography
            height="fit-content"
            textAlign="center"
            width="100%"
            sx={{ userSelect: "none" }}
          >
            {lastMessageData[userParam]?.userInfo?.firstName}{" "}
            {lastMessageData[userParam]?.userInfo?.lastName}
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            flexDirection="column"
            overflow="hidden"
            minWidth="45px"
            sx={{
              userSelect: "none",
              cursor: "pointer",
              filter: "drop-shadow(0px 1px 0px black)",
              ":hover": {
                ".imageArrow": {
                  left: "70px !important",
                },
              },
            }}
            onClick={() => navigate("/")}
          >
            <img
              src="/public/assets/logoSInArrow.png"
              alt="loop-icon"
              width="40"
              style={{ pointerEvents: "none" }}
            />
            <img
              src="/public/assets/arrow.png"
              alt="loop-icon"
              width="40"
              className="imageArrow"
              style={{
                transition: ".3s",
                pointerEvents: "none",
                position: "relative",
                left: "0",
              }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatNavbar;
