/* eslint-disable react/prop-types */
import { Box, useMediaQuery } from "@mui/system";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const OpenPhoto = ({ photo, setIsImagOpen }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 550px)");

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      bgcolor="#000000d6"
      zIndex="11111111111"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        top="0"
        left="0"
        width="100%"
        height="100%"
        onClick={() => {
          setIsImagOpen(false);
        }}
      ></Box>

      <IconButton
        sx={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: "111",
          color: "white",
        }}
        onClick={() => {
          setIsImagOpen(false);
        }}
      >
        <Close sx={{ fontSize: "21px" }} />
      </IconButton>

      <Box
        width={isNonMobileScreens ? "75%" : "100%"}
        height="75%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <img
          src={photo}
          style={{
            zIndex: "1",
            position: "relative",
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "cover",
          }}
        />
      </Box>
    </Box>
  );
};

export default OpenPhoto;
