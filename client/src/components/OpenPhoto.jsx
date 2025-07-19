/* eslint-disable react/prop-types */
import { Box, useMediaQuery } from "@mui/system";
import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const OpenPhoto = ({ photo, setIsImagOpen, from = "" }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 550px)");

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      width="100vw"
      height="100vh"
      bgcolor="#000000d6"
      zIndex={1300}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        position="absolute"
        top={0}
        left={0}
        width="100%"
        height="100%"
        onClick={() => setIsImagOpen(false)}
      />
      <Box
        position="relative"
        zIndex={2}
        display="flex"
        alignItems="center"
        justifyContent="center"
        width={isNonMobileScreens ? "75vw" : "95vw"}
        height={isNonMobileScreens ? "75vh" : "90vh"}
        onClick={handleContentClick}
      >
        <IconButton
          sx={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: "111",
            color: "white",
            background: "#00000088",
          }}
          onClick={() => {
            setIsImagOpen(false);
          }}
        >
          <Close sx={{ fontSize: "21px" }} />
        </IconButton>
        <img
          src={photo}
          alt="Opened"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            width:
              from === "userImage"
                ? isNonMobileScreens
                  ? "425px"
                  : "325px"
                : "100%",
            height:
              from === "userImage"
                ? isNonMobileScreens
                  ? "425px"
                  : "325px"
                : "100%",
            objectFit: from === "userImage" ? "cover" : "contain",
            borderRadius: from === "userImage" ? "50%" : "8px",
          }}
        />
      </Box>
    </Box>
  );
};

export default OpenPhoto;
