/* eslint-disable react/prop-types */
import { ImageOutlined } from "@mui/icons-material";
import {
  Box,
  Typography,
  InputBase,
  useTheme,
  Divider,
  useMediaQuery,
} from "@mui/material";
import UserImage from "../../components/UserImage";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useState } from "react";
import { useSelector } from "react-redux";
import FlexBetween from "../../components/FlexBetween";
import { Link } from "react-router-dom";
import WritePost from "../../components/post/WritePost";

const MyPostWidget = ({ picturePath }) => {
  const [isImage, setIsImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showWritePost, setShowWritePost] = useState(false);
  const [post, setPost] = useState("");
  const [textAddition, setTextAddition] = useState({ type: "", value: "" });

  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);

  const { palette } = useTheme();

  const testArabic = (description) => {
    const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return regexArabic.test(description);
  };

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <WidgetWrapper mb="10px">
      <Box display="flex" gap="20px" alignItems="center">
        {!post && (
          <Link to={`/profile/${_id}`}>
            <Box sx={{ cursor: "pointer" }}>
              <UserImage image={picturePath} />
            </Box>
          </Link>
        )}

        <Box width="100%">
          <InputBase
            multiline // make the input like Textarea
            maxRows={10}
            type="text"
            className={`${
              textAddition.value === "uppercase" && "myInputWidgetUppercase"
            }`}
            fullWidth
            sx={{
              fontWeight: textAddition.value === "bold" && "bold",

              borderRadius:
                !post && textAddition.value !== "quotation" && "50px",
              p: "14px 10px 14px 18px",
              bgcolor: palette.neutral.light,
              transition: ".3s",
              direction: testArabic(post) && "rtl",
              "::before": {
                content: textAddition.value === "quotation" && "'❝'",
                position: "absolute",
                fontSize: "20px",
                left: "6px",
                top: "4px",
              },
              "::after": {
                content: textAddition.value === "quotation" && "'❞'",
                position: "absolute",
                fontSize: "20px",
                right: "6px",
                top: "4px",
              },
              cursor: "pointer",
              "& > textarea": {
                cursor: "pointer",
              },
            }}
            placeholder="What is on your mind?"
            value={post}
            onChange={(e) => {
              if (e.target.value.length <= 2000) setPost(e.target.value);
              else if (e.target.value.length > 2000)
                setPost(e.target.value.slice(0, 2000));
            }}
            onClick={() => {
              setShowWritePost(!showWritePost);
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ mt: "10px" }} />
      <FlexBetween mt="10px">
        <FlexBetween
          gap="5px"
          p="3px"
          sx={{
            cursor: "pointer",
            userSelect: "none",
            borderRadius: "5px",
            transition: ".3s",
            ":hover": {
              bgcolor: "#54545433",
            },
          }}
          onClick={() => {
            setIsImage(true);
            setShowWritePost(true);
          }}
        >
          <ImageOutlined />
          <Typography color={palette.neutral.main}>Image</Typography>
        </FlexBetween>
      </FlexBetween>

      {showWritePost && (
        <WritePost
          showWritePost={showWritePost}
          setShowWritePost={setShowWritePost}
          palette={palette}
          setTextAddition={setTextAddition}
          textAddition={textAddition}
          post={post}
          setPost={setPost}
          user={user}
          setIsImage={setIsImage}
          setLoading={setLoading}
          loading={loading}
          isImage={isImage}
          isNonMobileScreens={isNonMobileScreens}
          token={token}
        />
      )}
    </WidgetWrapper>
  );
};

export default MyPostWidget;
