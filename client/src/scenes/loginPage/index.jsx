import { Box, useTheme, useMediaQuery, Typography } from "@mui/material";
import Form from "./Form";
import { useSelector } from "react-redux";

const LoginPage = () => {
  const theme = useTheme();

  const isNonMobileScreen = useMediaQuery("(min-width: 1000px)");

  const mode = useSelector((state) => state.mode);

  document.body.style.overflow = "auto";
  document.title = "Loop";

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
      {isNonMobileScreen && (
        <Box
          height="100%"
          width="100%"
          position="fixed"
          left="50%"
          top="50%"
          sx={{
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
            userSelect: "none",
            zIndex: "-2",
          }}
        >
          <img
            src="\public\assets\Untitled_Project-removebg-preview.png"
            alt=""
            width="100%"
          />
        </Box>
      )}

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
          <img
            src="/public/assets/Screenshot_13-10-2024_0245_picsart.com-removebg-preview.png"
            alt="loop-icon"
            width="100"
            style={{
              pointerEvents: "none",
              userSelect: "none",
            }}
          />

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

      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        style={{ position: "fixed", bottom: "0", left: "0", zIndex: "-1" }}
      >
        <path
          fill="#00b1d0"
          fillOpacity="1"
          d="M0,160L48,181.3C96,203,192,245,288,234.7C384,224,480,160,576,154.7C672,149,768,203,864,202.7C960,203,1056,149,1152,133.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        ></path>
      </svg>
    </Box>
  );
};

export default LoginPage;
