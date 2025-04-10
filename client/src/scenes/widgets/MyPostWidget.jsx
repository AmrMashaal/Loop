/* eslint-disable react/prop-types */
import {
  EditOutlined,
  DeleteOutlined,
  ImageOutlined,
  FormatQuote,
  Public,
  People,
  Lock,
} from "@mui/icons-material";
import {
  Box,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  Divider,
  useMediaQuery,
} from "@mui/material";
import Dropzone from "react-dropzone";
import UserImage from "../../components/UserImage";
import WidgetWrapper from "../../components/WidgetWrapper";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import FlexBetween from "../../components/FlexBetween";
import { Link } from "react-router-dom";
import { posts, setPosts } from "../../App";

const MyPostWidget = ({ picturePath, socket }) => {
  const [isImage, setIsImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [image, setImage] = useState(null);
  const [imageError, setImageError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [postPrivacy, setPostPrivacy] = useState("public");
  const [showPostPrivacy, setShowPostPrivacy] = useState(false);
  const [post, setPost] = useState("");
  const [textAddition, setTextAddition] = useState({ type: "", value: "" });

  const { _id } = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);

  const isMobileScreens = useMediaQuery("(max-width: 389px)");

  const { palette } = useTheme();

  const backgroundColors = [
    "#a1bb58",
    "#bb5858",
    "linear-gradient(to right, #89003054, #007a3342, #00000000)",
    "#586bbb",
    "#bb8558",
    "#906649",
    "#58bb6b",
  ];

  const handlePost = async (e) => {
    e.preventDefault();
    if ((post && !loading) || (image && !loading)) {
      const formData = new FormData();
      formData.append("userId", _id);
      formData.append("description", post);
      formData.append("privacy", postPrivacy);
      formData.append("textAddition", JSON.stringify(textAddition));
      setLoading(true);

      if (image) {
        formData.append("picture", image);
        formData.append("picturePath", image.name);
      }

      try {
        const response = await fetch(`/api/posts`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const post = await response.json();

        if (response.ok) {
          setPost("");
          setTextAddition({ type: "", value: "" });
          setImage(null);
          setImagePreview(null);
          setIsImage(false);

          setPosts([post, ...posts]);

          if (
            post.privacy !== "private" &&
            import.meta.env.VITE_NODE_ENV !== "production"
          ) {
            socket.emit("newPost", { post, friends: user.friends });

            socket.emit("notifications", {
              notification: {
                type: "newPost",
              },
              friends: user.friends,
              _id: user._id,
              token: token,
              firstName: user.firstName,
              postId: post._id,
            });
          }
        }
      } catch (err) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", err);
        }
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (image) {
      setTextAddition({ type: "", value: "" });
    }
  }, [image]);

  document.addEventListener("click", (event) => {
    const backgroundColorsParent = document.getElementById(
      "backgroundColorsParent"
    );

    const privacyParent = document.getElementById("privacyParent");

    if (event.target !== backgroundColorsParent) {
      setShowColors(false);
    }

    if (event.target !== privacyParent) {
      setShowPostPrivacy(false);
    }
  });

  const testArabic = (description) => {
    const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return regexArabic.test(description);
  };

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <WidgetWrapper mb="10px">
      <Box display="flex" gap="20px">
        {!post && (
          <Link to={`/profile/${_id}`}>
            <Box sx={{ cursor: "pointer" }}>
              <UserImage image={picturePath} />
            </Box>
          </Link>
        )}

        <Box width="100%">
          <form onSubmit={(e) => handlePost(e)}>
            <InputBase
              multiline // make the input like Textarea
              maxRows={10}
              type="text"
              className={`${
                textAddition.value === "quotation" && "myInputWidget"
              } ${
                textAddition.value === "uppercase" && "myInputWidgetUppercase"
              }`}
              fullWidth
              sx={{
                fontWeight: textAddition.value === "bold" && "bold",

                borderRadius:
                  !post && textAddition.value !== "quotation" && "50px",
                p: "14px 10px 14px 18px",
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
              }}
              placeholder="What is on your mind?"
              value={post}
              onChange={(e) => {
                if (e.target.value.length <= 1000) setPost(e.target.value);
                else if (e.target.value.length > 1000)
                  setPost(e.target.value.slice(0, 1000));
              }}
            />
          </form>

          <Box
            mt="10px"
            display="flex"
            justifyContent="space-between"
            flexWrap="wrap"
            gap="10px"
            sx={{ transition: ".3s" }}
            id="textAdditionsParent"
          >
            <Box display="flex" flexWrap="wrap" gap="6px">
              <Box
                width="50px"
                p="2px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                borderRadius="10px"
                bgcolor="#54545438"
                color={textAddition.value === "quotation" && "black"}
                sx={{
                  userSelect: "none",
                  cursor: "pointer",
                  outline:
                    textAddition.value === "quotation" && "1px solid gray",
                  ":hover": {
                    outline: "1px solid gray",
                  },
                }}
                onClick={() =>
                  setTextAddition(
                    textAddition.value !== "quotation" && !image
                      ? { type: "text", value: "quotation" }
                      : { type: "", value: "" }
                  )
                }
                id="quotation"
              >
                <FormatQuote
                  sx={{ transform: "rotate(180deg)", mr: "0 3px" }}
                />
                <FormatQuote sx={{ mr: "0 3px" }} />
              </Box>

              <Box
                p="2px 6px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                width="50px"
                textAlign="center"
                borderRadius="10px"
                bgcolor="#54545438"
                color={textAddition.value === "bold" && "black"}
                fontWeight="bold"
                sx={{
                  userSelect: "none",
                  cursor: "pointer",
                  outline: textAddition.value === "bold" && "1px solid gray",
                  ":hover": {
                    outline: "1px solid gray",
                  },
                }}
                onClick={() =>
                  setTextAddition(
                    textAddition.value !== "bold" && !image
                      ? { type: "text", value: "bold" }
                      : { type: "", value: "" }
                  )
                }
                id="bold"
              >
                Bold
              </Box>

              <Box
                p="2px 6px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                borderRadius="10px"
                bgcolor="#54545438"
                color={textAddition.value === "uppercase" && "black"}
                sx={{
                  userSelect: "none",
                  cursor: "pointer",
                  outline:
                    textAddition.value === "uppercase" && "1px solid gray",
                  ":hover": {
                    outline: "1px solid gray",
                  },
                }}
                onClick={() =>
                  setTextAddition(
                    textAddition.value !== "uppercase" && !image
                      ? { type: "text", value: "uppercase" }
                      : { type: "", value: "" }
                  )
                }
                id="uppercase"
              >
                UPPERCASE
              </Box>
            </Box>

            <Box
              position="relative"
              display="flex"
              gap="5px"
              alignItems="center"
            >
              <Box
                p="2px 20px"
                borderRadius="10px"
                textAlign="center"
                sx={{
                  ":hover": {
                    outline: "1px solid gray",
                  },
                  cursor: "pointer",
                  userSelect: "none",
                }}
                id="privacyParent"
                onClick={() => {
                  setShowPostPrivacy(true);
                }}
              >
                {postPrivacy}
              </Box>

              {showPostPrivacy && (
                <Box
                  position="absolute"
                  top="35px"
                  left={!isMobileScreens && "9%"}
                  display="flex"
                  gap="15px"
                  bgcolor={palette.neutral.light}
                  flexWrap="wrap"
                  justifyContent="center"
                  padding="10px 4px"
                  borderRadius="9px"
                  zIndex="111"
                  sx={{ transform: !isMobileScreens && "translateX(-50%)" }}
                >
                  {["public", "friends", "private"].map((privacy, index) => {
                    return (
                      <Box
                        key={index}
                        display="flex"
                        gap="4px"
                        alignItems="center"
                        sx={{
                          cursor: "pointer",
                          outline:
                            postPrivacy === privacy &&
                            `3px solid ${palette.primary.main}`,
                          ":hover": {
                            outline: `2px dashed ${palette.primary.main}`,
                          },
                        }}
                        p="5px 10px"
                        borderRadius="5px"
                        onClick={() => {
                          setPostPrivacy(privacy);
                          setShowPostPrivacy(false);
                        }}
                      >
                        {privacy}

                        {privacy === "public" ? (
                          <Public />
                        ) : privacy === "friends" ? (
                          <People />
                        ) : (
                          <Lock />
                        )}
                      </Box>
                    );
                  })}
                </Box>
              )}

              <Box
                p="2px 8px"
                display="flex"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                borderRadius="10px"
                color={
                  backgroundColors.find(
                    (color) => color === textAddition.value
                  ) && "white"
                }
                sx={{
                  userSelect: "none",
                  cursor: "pointer",
                  background:
                    backgroundColors.find(
                      (color) => color === textAddition.value
                    ) &&
                    backgroundColors.find(
                      (color) => color === textAddition.value
                    ),
                  outline:
                    backgroundColors.find(
                      (color) => color === textAddition.value
                    ) && "1px solid gray",
                  ":hover": {
                    outline: "1px solid gray",
                  },
                }}
                onClick={() => setShowColors(!showColors)}
                id="backgroundColorsParent"
              >
                background
              </Box>

              {showColors && (
                <Box
                  width="200px"
                  position="absolute"
                  top="35px"
                  left={!isMobileScreens && "40%"}
                  display="flex"
                  gap="10px"
                  bgcolor={palette.neutral.light}
                  zIndex="1"
                  flexWrap="wrap"
                  justifyContent="center"
                  padding="13px"
                  borderRadius="9px"
                  sx={{ transform: !isMobileScreens && "translateX(-50%)" }}
                >
                  {backgroundColors?.map((color, index) => {
                    return (
                      <Box
                        key={index}
                        sx={{
                          background: color,
                          cursor: "pointer",
                          outline:
                            textAddition.value === color &&
                            `3px solid ${palette.primary.main}`,
                          ":hover": {
                            outline: `2px dashed ${palette.primary.main}`,
                          },
                        }}
                        p="14px"
                        borderRadius="5px"
                        onClick={() =>
                          setTextAddition(
                            textAddition.value !== color && !image
                              ? { type: "color", value: color }
                              : { type: "", value: "" }
                          )
                        }
                      ></Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {isImage && (
        <Box
          mt="15px"
          sx={{
            gridColumn: "span 4",
            borderRadius: "4px",
            userSelect: "none",
          }}
        >
          <Dropzone
            accept=".jpg,.jpeg,.png,.webp"
            multiple={false}
            onDrop={(acceptedFiles) => {
              const file = acceptedFiles[0];
              const fileExtension = file.name.split(".").pop().toLowerCase();
              if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
                setImage(file);
                setImagePreview(URL.createObjectURL(file));
                setImageError(null);
              } else if (
                !["jpg", "jpeg", "png", "webp"].includes(fileExtension)
              ) {
                setImageError("This file is not supported");
              }
            }}
          >
            {({ getRootProps, getInputProps }) => (
              <Box
                {...getRootProps()}
                padding="1rem"
                border={`2px dashed ${palette.neutral.medium}`}
                sx={{ cursor: "pointer" }}
              >
                <input {...getInputProps()} />
                {!image ? (
                  <FlexBetween>
                    <p>Add Picture Here</p>
                    <IconButton>
                      <EditOutlined />
                    </IconButton>
                  </FlexBetween>
                ) : (
                  <Box position="relative">
                    <Box>
                      <img
                        src={imagePreview}
                        alt="preview"
                        width="100%"
                        style={{
                          maxHeight: isNonMobileScreens ? "500px" : "312px",
                          objectFit: "cover",
                        }}
                      />
                    </Box>

                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageError(null);
                        setImage(null);
                        setImagePreview(null);
                      }}
                      sx={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        bgcolor: "#00000073",
                        color: "white",
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Dropzone>
        </Box>
      )}

      {imageError && isImage && (
        <Box color="red" mt="8px">
          {imageError}
        </Box>
      )}

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
            setIsImage(!isImage);
          }}
        >
          <ImageOutlined />
          <Typography>Image</Typography>
        </FlexBetween>
        <Button
          onClick={handlePost}
          type="submit"
          disabled={post === "" && !image}
        >
          {loading ? (
            <Box display="flex" gap="4px">
              loading
              <Box
                className="loadingAnimation"
                width="20px"
                height="20px"
              ></Box>
            </Box>
          ) : (
            "Share"
          )}
        </Button>
      </FlexBetween>
    </WidgetWrapper>
  );
};

export default MyPostWidget;
