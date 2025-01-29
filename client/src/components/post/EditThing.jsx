/* eslint-disable react/prop-types */
import { useTheme } from "@emotion/react";
import { SendOutlined } from "@mui/icons-material";
import { Divider, IconButton, InputBase } from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const EditThing = ({ setIsEdit, text, thingId, setDataState, type }) => {
  const [editText, setEditText] = useState(`${text || ""}`);

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");
  const { palette } = useTheme();

  const inputRef = useRef(null);

  const token = useSelector((state) => state.token);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editText.length > 0) {
      if (type !== "reply") {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/comments/${thingId}/edit`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ text: editText }),
            }
          );

          const editedComment = await response.json();

          setDataState((prev) =>
            prev.map((newCom) =>
              newCom._id === thingId ? editedComment : newCom
            )
          );

          setIsEdit(false);
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const response = await fetch(
            `${import.meta.env.VITE_API_URL}/replies/${thingId}/edit`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ reply: editText }),
            }
          );

          const editedReply = await response.json();

          setDataState((prev) =>
            prev.map((com) => {
              if (com._id === editedReply.comment) {
                return {
                  ...com,
                  replies: com.replies.map((rep) =>
                    rep._id === thingId
                      ? { ...rep, reply: editedReply.reply }
                      : rep
                  ),
                };
              }
            })
          );

          setIsEdit(false);
        } catch (error) {
          console.log(error);
        }
      }
    }
  };

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
      justifyContent="center"
      zIndex="111"
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
        width={isNonMobileScreens ? "500px" : "100%"}
        display="flex"
        justifyContent="center"
        flexDirection="column"
        minHeight="100px"
        position="relative"
        sx={{
          maxWidth: "100%",
          zIndex: "1",
          maxHeight: isNonMobileScreens ? "700px" : "312px",
          overflow: "auto",
          borderRadius: isNonMobileScreens ? "0.75rem" : "0",
        }}
      >
        <form
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
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
              if (e.target.value.length <= 500) setEditText(e.target.value);
              else if (e.target.value.length > 500)
                setEditText(e.target.value.slice(0, 500));
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
      </Box>
    </Box>
  );
};

export default EditThing;
