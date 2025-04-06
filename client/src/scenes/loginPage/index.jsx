import { Box, useTheme, useMediaQuery } from "@mui/material";
import Form from "./Form";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { setIsOverFlow } from "../../App";

const LoginPage = () => {
  const theme = useTheme();

  const isNonMobileScreen = useMediaQuery("(min-width: 1000px)");

  const mode = useSelector((state) => state.mode);

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
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(27 102 176 / 19%)"
        top="-200px"
        left="-172px"
        zIndex="10"
        sx={{
          opacity: mode === "light" ? "0.1" : "0.07",
          background:
            "radial-gradient(circle, rgb(30 144 255 / 65%), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

      <Box
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(255 31 198 / 13%)"
        bottom="-200px"
        right="-172px"
        zIndex="10"
        sx={{
          opacity: mode === "light" ? "0.1" : "0.1",
          background:
            "radial-gradient(circle, rgb(255 31 223 / 63%), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

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
              background: "#d0d0d0",
              "&:hover": {
                background: "#a0a0a0",
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
          >
            {/* <Typography
            fontSize="25px"
            fontWeight="800"
            textTransform="uppercase"
            alignSelf={isNonMobileScreen ? undefined : "end"}
            sx={{ userSelect: "none" }}
            className="loopAnimation"
          >
            Welcome In Loop
          </Typography> */}
          </Box>

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
