import { Box, useTheme, useMediaQuery } from "@mui/material";
import Form from "./Form";
import { useEffect } from "react";
import { setIsOverFlow } from "../../App";

const LoginPage = () => {
  const theme = useTheme();

  const isNonMobileScreen = useMediaQuery("(min-width: 1000px)");

  useEffect(() => {
    document.title = "Loop";
    setIsOverFlow(false);
  }, []);

  const defaultColor = theme.palette.background.default;

  return (
    <Box
      position="relative"
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bgcolor="#e9e9e9"
    >
      <Box
        display="flex"
        justifyContent="center"
        height={isNonMobileScreen ? "90%" : "100%"}
        width={isNonMobileScreen ? "80%" : "100%"}
      >
        {isNonMobileScreen && (
          <Box
            position="relative"
            flexBasis="40%"
            height="auto"
            sx={{ pointerEvents: "none", userSelect: "none" }}
          >
            <img
              src="\assets\loop-login.png"
              alt=""
              width="100%"
              height="100%"
              style={{ objectFit: "cover", borderRadius: "10px 0 0 10px" }}
            />

            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              sx={{
                background:
                  "linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.8) 100%)",
                borderRadius: "10px 0 0 10px",
                pointerEvents: "none",
              }}
            ></Box>
          </Box>
        )}
        <Box
          flexBasis={isNonMobileScreen ? "60%" : "100%"}
          p={isNonMobileScreen ? "3rem 6rem" : "2rem"}
          borderRadius="5px"
          bgcolor={defaultColor}
          maxWidth="1000px"
          overflow="auto"
          height="100%"
          sx={{
            "&::-webkit-scrollbar-thumb": {
              background: "#a0a0a0",
              "&:hover": {
                background: "#8c8c8c",
              },
            },
            "&::-webkit-scrollbar": {
              width: "7px",
              background: "transparent",
            },
          }}
        >
          <Box
            display="flex"
            alignItems={isNonMobileScreen ? "end" : undefined}
            gap="10px"
            flexDirection={isNonMobileScreen ? "row" : "column"}
            bgcolor={isNonMobileScreen ? "white" : "unset"}
            sx={{ borderRadius: "0 10px 10px 0" }}
          ></Box>

          <Form />

          <Box
            sx={{
              background:
                "linear-gradient(180deg, rgb(55 55 55 / 24%) 0%, rgb(109 146 255 / 0%) 100%)",
              borderRadius: "0 10px 10px 0",
              pointerEvents: "none",
              position: "absolute",
              top: "0",
              left: "0",
              width: "100%",
              height: "100%",
              zIndex: "1",
            }}
          ></Box>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
