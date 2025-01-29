/* eslint-disable react/prop-types */
import { Box, useMediaQuery } from "@mui/system";
import { useTheme } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { Divider, IconButton, InputBase } from "@mui/material";
import { SendOutlined } from "@mui/icons-material";

const PostEdited = ({ setIsEdit, image, description, handleEditPost }) => {
  const [editText, setEditText] = useState(`${description || ""}`);
  const { palette } = useTheme();
  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const testArabic = regexArabic.test(editText);

  return (
    <Box
      position="fixed"
      width="100%"
      height="100%"
      top="0"
      left="0"
      display="flex"
      alignItems="center"
      zIndex="11111111111"
      justifyContent="center"
    >
      <Box
        position="absolute"
        width="100%"
        height="100%"
        onClick={() => {
          setIsEdit(false);
        }}
        bgcolor="#00000066"
      ></Box>
      <Box
        bgcolor={palette.neutral.light}
        p="10px 28px"
        zIndex="11"
        mx={isNonMobileScreens ? "30px" : "0"}
        sx={{ borderRadius: isNonMobileScreens ? ".75rem" : "0" }}
        minWidth={isNonMobileScreens ? "500px" : "100%"}
      >
        <form
          onSubmit={(e) => {
            handleEditPost(e, editText, description), setIsEdit(false);
          }}
          style={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <InputBase
            type="text"
            fullWidth
            multiline
            maxRows={10}
            inputRef={inputRef}
            placeholder="What do you want to change?"
            value={editText}
            onChange={(e) => {
              if (e.target.value.length <= 1000) setEditText(e.target.value);
              else if (e.target.value.length > 1000)
                setEditText(e.target.value.slice(0, 1000));
            }}
            sx={{
              p: "10px 0",
              width: "100%",
              direction: testArabic ? "rtl" : "ltr",
            }}
          />
          <IconButton type="submit">
            <SendOutlined />
          </IconButton>
        </form>
        <Divider />
        {image && (
          <Box mt="10px">
            <img
              src={image}
              alt=""
              width={isNonMobileScreens ? "500px" : "100%"}
              style={{
                maxWidth: "100%",
                maxHeight: "400px",
                objectFit: "cover",
                borderRadius: ".75rem",
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PostEdited;
