import { VerifiedUser } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import { setLogout } from "../../state";
import { useTheme } from "@emotion/react";
import { useDispatch } from "react-redux";
import { useEffect } from "react";

const WrongPassword = () => {
  const { palette } = useTheme();

  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(setLogout());
    }, 10000);
  });

  return (
    <Box
      position="fixed"
      width="100%"
      height="100%"
      top="0"
      left="0"
      display="flex"
      alignItems="center"
      zIndex="111"
      justifyContent="center"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        bgcolor="#00000066"
      ></Box>

      <Box
        bgcolor={palette.neutral.light}
        p="10px 28px"
        width={isNonMobileScreens ? "500px" : "100%"}
        display="flex"
        flexDirection="column"
        alignItems="center"
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
        <VerifiedUser sx={{ color: "#aac3f9", fontSize: "190px" }} />
        <Typography
          fontWeight="500"
          fontSize="20px"
          textAlign="center"
          lineHeight="2rem"
        >
          Your password was changed.
          <Typography color={palette.neutral.medium} fontSize="16px">
            Please log in again to secure your account.
          </Typography>
        </Typography>

        <Button
          sx={{
            bgcolor: palette.primary.main,
            color: "black",
            width: "30%",
            mt: "10px",
          }}
          onClick={() => dispatch(setLogout())}
        >
          Sign out
        </Button>
      </Box>
    </Box>
  );
};

export default WrongPassword;
