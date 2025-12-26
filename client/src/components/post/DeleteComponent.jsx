/* eslint-disable react/prop-types */
import { useTheme } from "@emotion/react";
import { Button } from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";

const DeleteComponent = ({
  setIsDelete,
  handleDeletePost,
  type,
  setIsDeleteComment,
  handleDeleteComment,
  handleRemoveFriend,
  setIsDeleteReply,
  handleDeleteReply,
}) => {
  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const allHandleDelete = () => {
    if (type === "post") {
      handleDeletePost();
      setIsDelete(false);
    } else if (type === "comment") {
      handleDeleteComment();
      setIsDeleteComment(false);
    } else if (type === "removeFriend") {
      handleRemoveFriend();
      setIsDelete(false);
    } else if (type === "reply") {
      handleDeleteReply();
      setIsDeleteReply(false);
    }
  };

  return (
    <Box
      position="fixed"
      width="100%"
      height="100%"
      top="0"
      left="0"
      display="flex"
      alignItems="center"
      justifyContent="center"
      zIndex="1111"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        onClick={() => {
          type === "post" || type === "removeFriend"
            ? setIsDelete(false)
            : setIsDeleteComment(false);
        }}
        bgcolor="#00000066"
      ></Box>
      <Box
        bgcolor={palette.neutral.light}
        p="10px 28px"
        width={isNonMobileScreens ? "500px" : "100%"}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        position="relative"
        height="100px"
        sx={{
          maxWidth: "100%",
          zIndex: "1",
          overflow: "auto",
          borderRadius: isNonMobileScreens ? "0.75rem" : "0",
        }}
      >
        <Box
          display="flex"
          gap="20px"
          alignItems="center"
          justifyContent="center"
        >
          <Button
            sx={{
              bgcolor: "#9e1125b3",
              color: "white",
              width: "130px",
              ":hover": {
                bgcolor: "#760e1d47",
              },
            }}
            onClick={allHandleDelete}
          >
            Remove
          </Button>
          <Button
            sx={{
              bgcolor: "#57575780",
              color: "white",
              width: "130px",
              ":hover": {
                bgcolor: "#44444480",
              },
            }}
            onClick={() => {
              if (type === "post" || type === "removeFriend")
                setIsDelete(false);
              else if (type === "comment") setIsDeleteComment(false);
              else if (type === "reply") setIsDeleteReply(false);
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default DeleteComponent;