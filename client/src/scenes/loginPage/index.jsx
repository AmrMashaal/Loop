import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";
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
    <Box position="relative">
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
        width={isNonMobileScreen ? "50%" : "90%"}
        p="2rem"
        borderRadius="5px"
        height="fit-content"
        margin="0 auto 20px"
        bgcolor={defaultColor}
        maxWidth="1000px"
      >
        <Box
          display="flex"
          alignItems={isNonMobileScreen ? "end" : undefined}
          gap="10px"
          flexDirection={isNonMobileScreen ? "row" : "column"}
        >
          <Typography
            fontSize="25px"
            fontWeight="800"
            textTransform="uppercase"
            alignSelf={isNonMobileScreen ? undefined : "end"}
            sx={{ userSelect: "none" }}
            className="loopAnimation"
          >
            Welcome In Loop
          </Typography>
        </Box>

        <Form />
      </Box>
    </Box>
  );
};

export default LoginPage;
