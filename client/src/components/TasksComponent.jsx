/* eslint-disable react/prop-types */
import { Close } from "@mui/icons-material";
import { Divider, IconButton, Typography } from "@mui/material";
import { Box, useMediaQuery, useTheme } from "@mui/system";
import { useEffect } from "react";

const TasksComponent = ({ children, open, setOpen, description, id = "" }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  return (
    <Box
      position="fixed"
      width="100%"
      height="100%"
      top="0"
      left="0"
      display="flex"
      alignItems="center"
      zIndex="11111"
      justifyContent="center"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        onClick={() => {
          setOpen(false);
        }}
        bgcolor="#00000066"
      ></Box>

      <Box
        bgcolor={theme.palette.neutral.light}
        p={isNonMobileScreens ? "10px 28px" : "10px 18px"}
        width={isNonMobileScreens ? "600px" : "100%"}
        display="flex"
        flexDirection="column"
        gap="14px"
        minHeight="660px"
        position="relative"
        borderRadius={isNonMobileScreens ? "0.75rem" : "0"}
        sx={{
          maxWidth: "100%",
          zIndex: "1",
          maxHeight: isNonMobileScreens ? "700px" : "312px",
          overflow: "auto",
        }}
        id={id}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          zIndex="10"
          bgcolor={theme.palette.neutral.light}
          position="sticky"
          top="-11px"
          pt="10px"
          sx={{ userSelect: "none" }}
        >
          <Typography fontSize="15px" textTransform="capitalize">
            {description}
          </Typography>
          <IconButton onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        <Divider />
        {children}
      </Box>
    </Box>
  );
};

export default TasksComponent;
