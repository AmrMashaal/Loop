/* eslint-disable react/prop-types */
import { Box } from "@mui/system";
import TasksComponent from "../TasksComponent";
import {
  Button,
  Divider,
  IconButton,
  InputBase,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Close,
  FormatQuote,
  Highlight,
  Image,
  ImageOutlined,
  Lock,
  People,
  Public,
} from "@mui/icons-material";
import { useState } from "react";
import UserImage from "../UserImage";
import Dropzone from "react-dropzone";
import { posts, setPosts } from "../../App";
import socket from "../socket";
import CircleLength from "../CircleLength";

const WritePost = ({
  showWritePost,
  setShowWritePost,
  palette,
  textAddition,
  setTextAddition,
  post,
  setPost,
  user,
  setLoading,
  loading,
  isNonMobileScreens,
  token,
  setIsImage,
  isImage,
}) => {
  const [isShowPrivacy, setIsShowPrivacy] = useState(false);
  const [privacy, setPrivacy] = useState("public");
  const [imageError, setImageError] = useState(null);
  const [image, setImage] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  const handlePost = async (e) => {
    e.preventDefault();

    if ((post && !loading) || (image.length > 0 && !loading)) {
      const formData = new FormData();
      formData.append("userId", user._id);
      formData.append("description", post);
      formData.append("privacy", privacy);
      formData.append("textAddition", JSON.stringify(textAddition));
      setLoading(true);

      if (image && image.length > 0) {
        image.forEach((file) => {
          formData.append("picture", file);
        });
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
          setImage([]);
          setImagePreview([]);
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
        setShowWritePost(false);
        setIsImage(false);
        setImage([]);
        setImagePreview([]);
        setPost("");
        setTextAddition({ type: "", value: "" });
      }
    }
  };

  const testArabic = (description) => {
    const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
    return regexArabic.test(description);
  };

  const handleSelextion = (type) => {
    if (post.length <= 2998) {
      let newText;
      const textArea = document.getElementById("textAreaPost");
      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;

      const signs = (text) => {
        if (type === "bold") return `*${text}*`;
        else if (type === "italic") return `_${text}_`;
        else if (type === "strikethrough") return `~${text}~`;
        else if (type === "uppercase") return `^${text}^`;
        else if (type === "highlight") return `"${text}"`;
      };

      const selectedText = textArea.value.slice(start, end).trim();

      if (selectedText.trim().length === 0 && type !== "quotation") {
        newText = textArea.value + signs(type);
      } else if (type === "quotation") {
        newText = "> " + (textArea.value || "quotation");
      }

      if (selectedText.trim().length > 0) {
        if (type === "bold") {
          newText =
            textArea.value.slice(0, start) +
            `*${selectedText}*` +
            textArea.value.slice(end);
        } else if (type === "italic") {
          newText =
            textArea.value.slice(0, start) +
            `_${selectedText}_` +
            textArea.value.slice(end);
        } else if (type === "strikethrough") {
          newText =
            textArea.value.slice(0, start) +
            `~${selectedText}~` +
            textArea.value.slice(end);
        } else if (type === "uppercase") {
          newText =
            textArea.value.slice(0, start) +
            `^${selectedText}^` +
            textArea.value.slice(end);
        } else if (type === "highlight") {
          newText =
            textArea.value.slice(0, start) +
            `"${selectedText}"` +
            textArea.value.slice(end);
        }
      }

      textArea.value = newText;

      setPost(newText);
    }
  };

  return (
    <TasksComponent
      description="Write a post"
      open={showWritePost}
      setOpen={setShowWritePost}
    >
      <Box
        display="flex"
        alignItems="center"
        gap=".5rem"
        justifyContent="space-between"
        sx={{ userSelect: "none" }}
        flexDirection={isNonMobileScreens ? "row" : "column"}
        position="sticky"
        top="34px"
        bgcolor={palette.neutral.light}
        zIndex="1"
        py="10px"
      >
        <Box my="-10px" alignSelf="start">
          <Tooltip arrow placement="top" title="Bold">
            <IconButton onClick={() => handleSelextion("bold")}>
              <Typography
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="21px"
                width="30px"
                height="30px"
                color={
                  textAddition?.value !== "bold"
                    ? palette.neutral.main
                    : palette.primary.main
                }
              >
                B
              </Typography>
            </IconButton>
          </Tooltip>

          <Tooltip arrow placement="top" title="Italic">
            <IconButton onClick={() => handleSelextion("italic")}>
              <Typography
                fontStyle="italic"
                fontWeight="bold"
                fontSize="21px"
                fontFamily="monospace"
                width="30px"
                height="30px"
                color={
                  textAddition?.value !== "italic"
                    ? palette.neutral.main
                    : palette.primary.main
                }
              >
                I
              </Typography>
            </IconButton>
          </Tooltip>

          <Tooltip arrow placement="top" title="Strikethrough">
            <IconButton onClick={() => handleSelextion("strikethrough")}>
              <Typography
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="21px"
                color={
                  textAddition?.value !== "strikethrough"
                    ? palette.neutral.main
                    : palette.primary.main
                }
                width="30px"
                height="30px"
                sx={{ textDecoration: "line-through" }}
              >
                U
              </Typography>
            </IconButton>
          </Tooltip>

          <Tooltip arrow placement="top" title="Uppercase">
            <IconButton onClick={() => handleSelextion("uppercase")}>
              <Typography
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="21px"
                color={
                  textAddition?.value !== "uppercase"
                    ? palette.neutral.main
                    : palette.primary.main
                }
                width="30px"
                height="30px"
              >
                Aa
              </Typography>
            </IconButton>
          </Tooltip>

          {/* <Tooltip arrow placement="top" title="quotation">
            <IconButton
              onClick={() => handleSelextion("quotation")}
              sx={{ width: "50px", height: "50px" }}
            >
              <FormatQuote
                sx={{
                  transform: "rotate(180deg)",
                  mr: "0 3px",
                  color:
                    textAddition?.value !== "quotation"
                      ? palette.neutral.main
                      : palette.primary.main,
                }}
              />
              <FormatQuote
                sx={{
                  mr: "0 3px",
                  color:
                    textAddition?.value !== "quotation"
                      ? palette.neutral.main
                      : palette.primary.main,
                }}
              />
            </IconButton>
          </Tooltip> */}

          <Tooltip arrow placement="top" title="Highlight">
            <IconButton onClick={() => handleSelextion("highlight")}>
              <Typography
                fontFamily="monospace"
                fontWeight="bold"
                fontSize="21px"
                color={
                  textAddition?.value !== "uppercase"
                    ? palette.neutral.main
                    : palette.primary.main
                }
                width="30px"
                height="30px"
              >
                <Highlight />
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>

        <IconButton
          sx={{ borderRadius: "5px", alignSelf: "end" }}
          onClick={() => setIsImage(!isImage)}
        >
          <Box display="flex" gap="3px" alignItems="center">
            <ImageOutlined
              sx={{
                fontSize: "21px",
                color: palette.neutral.main,
                cursor: "pointer",
              }}
            />

            <Typography color={palette.neutral.main}>Image</Typography>
          </Box>
        </IconButton>
      </Box>

      <Divider />

      <Box>
        <Box display="flex" gap="8px" alignItems="center">
          <UserImage image={user.picturePath} size="45" />

          <Box>
            <Typography fontSize="13px">
              {user.firstName} {user.lastName}
            </Typography>

            <Box
              display="flex"
              alignItems="center"
              gap="4px"
              borderRadius="5px"
              border="1px solid gray"
              p="2px 5px"
              position="relative"
              sx={{ cursor: "pointer", userSelect: "none" }}
              onClick={() => setIsShowPrivacy(!isShowPrivacy)}
            >
              {privacy === "public" ? (
                <Public sx={{ fontSize: "16px", color: "text.secondary" }} />
              ) : privacy === "friends" ? (
                <People sx={{ fontSize: "16px", color: "text.secondary" }} />
              ) : (
                <Lock sx={{ fontSize: "16px", color: "text.secondary" }} />
              )}
              <Typography variant="body2" color="text.secondary">
                {privacy}
              </Typography>

              <Box
                sx={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderTop: "8px solid gray",
                }}
              />

              {isShowPrivacy && (
                <Box position="absolute" zIndex="1" top="20px" right="0">
                  <Box
                    display="flex"
                    flexDirection="column"
                    gap="5px"
                    borderRadius="5px"
                    border="1px solid gray"
                    overflow="hidden"
                    sx={{ backgroundColor: palette.neutral.light }}
                  >
                    {["public", "friends", "private"].map((item) => (
                      <Box
                        display="flex"
                        alignItems="center"
                        gap="4px"
                        p="5px"
                        sx={{
                          cursor: "pointer",
                          userSelect: "none",
                          ":hover": {
                            bgcolor: "#5353534d",
                          },
                        }}
                        onClick={() => {
                          setPrivacy(item);
                          setIsShowPrivacy(false);
                        }}
                        key={item}
                      >
                        {item === "public" ? (
                          <Public
                            sx={{ fontSize: "16px", color: "text.secondary" }}
                          />
                        ) : item === "friends" ? (
                          <People
                            sx={{ fontSize: "16px", color: "text.secondary" }}
                          />
                        ) : (
                          <Lock
                            sx={{ fontSize: "16px", color: "text.secondary" }}
                          />
                        )}

                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <form style={{ position: "relative" }} onSubmit={handlePost}>
          <InputBase
            sx={{
              width: "100%",
              fontSize: "15px",
              "& .MuiInputBase-input": {
                padding: "10px",
                lineHeight: "22px",
                fontWeight: textAddition?.value === "bold" ? "bold" : "unset",
                fontStyle:
                  textAddition?.value === "italic" ? "italic" : "unset",
                textDecoration:
                  textAddition?.value === "strikethrough"
                    ? "line-through"
                    : "unset",
                textTransform:
                  textAddition?.value === "uppercase" ? "uppercase" : "unset",
                px: textAddition?.value === "quotation" ? "25px" : undefined,
                direction: testArabic(post) ? "rtl" : "unset",
              },
            }}
            id="textAreaPost"
            multiline
            fullWidth
            value={post}
            onChange={(e) => {
              const newText = e.target.value;
              if (newText.length <= 3000) {
                setPost(newText);
              }
            }}
            placeholder="What's on your mind?"
          />

          {textAddition.value === "quotation" && (
            <>
              <FormatQuote
                sx={{
                  position: "absolute",
                  top: "0px",
                  left: "-5px",
                  transform: "rotate(180deg)",
                  color: palette.neutral.main,
                  fontSize: "30px",
                }}
              />

              <FormatQuote
                sx={{
                  position: "absolute",
                  top: "0px",
                  right: "-5px",
                  color: palette.neutral.main,
                  fontSize: "30px",
                }}
              />
            </>
          )}
        </form>
      </Box>

      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        gap="10px"
        justifyContent="end"
      >
        {(isImage || image.length > 0) && (
          <Box
            mt="15px"
            border="1px solid gray"
            borderRadius="5px"
            p="6px"
            sx={{
              borderRadius: "4px",
              userSelect: "none",
            }}
          >
            <Dropzone
              accept=".jpg,.jpeg,.png,.webp"
              multiple={true}
              maxFiles={5}
              onDrop={(acceptedFiles) => {
                const file = acceptedFiles[0];
                const fileExtension = file.name.split(".").pop().toLowerCase();
                if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
                  if (imagePreview.length <= 3) {
                    setImagePreview((prev) => [
                      ...prev,
                      URL.createObjectURL(file),
                    ]);

                    setImage((prev) => [...prev, file]);
                  }
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
                  padding={image.length === 0 ? "2rem" : "0"}
                  bgcolor="#b1b1b133"
                  borderRadius="5px"
                  sx={{
                    cursor: "pointer",
                  }}
                  className={imagePreview.length === 0 && "opacityBox"}
                >
                  <input {...getInputProps()} />
                  {image.length === 0 ? (
                    <Box
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      gap="5px"
                      flexDirection="column"
                    >
                      <Image
                        sx={{
                          bgcolor: palette.neutral.light,
                          p: "5px",
                          borderRadius: "50%",
                          fontSize: "35px",
                          color: palette.neutral.main,
                        }}
                      />

                      <Box textAlign="center">
                        <Typography fontSize="18px" fontWeight="500">
                          Add Picture Here
                        </Typography>

                        <Typography
                          fontSize="12px"
                          color={palette.neutral.main}
                          mt="-3px"
                        >
                          or drag and drop
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box position="relative">
                      <Box
                        display="grid"
                        gap="5px"
                        gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                      >
                        {imagePreview.map((file, index) => {
                          return (
                            <img
                              key={index}
                              src={file}
                              alt="preview"
                              width="100%"
                              style={{
                                height:
                                  imagePreview.length > 1 ? "300px" : "500px",
                                objectFit: "cover",
                                borderRadius: "5px",
                                gridColumn:
                                  index === 0 &&
                                  (imagePreview.length === 1 ||
                                    imagePreview.length > 2)
                                    ? "span 4"
                                    : "span 2",
                              }}
                            />
                          );
                        })}
                      </Box>

                      <Box
                        display="flex"
                        gap="5px"
                        alignItems="center"
                        sx={{
                          position: "absolute",
                          top: "5px",
                          left: "5px",
                          width: "100%",
                          justifyContent: "space-between",
                        }}
                      >
                        <IconButton
                          sx={{
                            bgcolor: palette.neutral.main,
                            borderRadius: "5px",
                            display: "flex",
                            gap: "5px",
                            alignItems: "center",
                          }}
                        >
                          <Image sx={{ color: palette.neutral.light }} />

                          <Typography
                            fontSize="12px"
                            color={palette.neutral.light}
                          >
                            Add more photos
                          </Typography>
                        </IconButton>

                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            setImageError(null);
                            setImage([]);
                            setImagePreview([]);
                          }}
                          sx={{
                            bgcolor: palette.neutral.medium,
                            color: palette.primary.medium,
                          }}
                        >
                          <Close />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </Dropzone>

            {imageError && (
              <Typography color="red" fontSize="12px" mt="5px">
                {imageError}
              </Typography>
            )}
          </Box>
        )}

        <Box
          display="flex"
          gap="10px"
          width="100%"
          justifyContent="space-between"
          position="sticky"
          bottom="-10px"
          p="10px 0 0"
          bgcolor={palette.neutral.light}
        >
          <CircleLength text={post} size="40" />

          <Button
            sx={{
              color: "white",
              background: palette.primary.main,
              width: "250px",
              alignSelf: "end",
              justifySelf: "end",
              mb: "20px",
            }}
            type="submit"
            onClick={handlePost}
            disabled={
              loading ||
              (!post?.trim() && image.length === 0) ||
              post.length > 3000
            }
          >
            {loading ? "Loading..." : "Post"}
          </Button>
        </Box>
      </Box>
    </TasksComponent>
  );
};

export default WritePost;
