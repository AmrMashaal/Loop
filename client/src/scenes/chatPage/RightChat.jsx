/* eslint-disable react/prop-types */
import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import UserImage from "../../components/UserImage";
import OpenPhoto from "../../components/OpenPhoto";
import { setIsOverFlow } from "../../App";
import {
  Check,
  Close,
  DeleteOutlined,
  EmojiEmotions,
  Image,
  Reply,
  Send,
} from "@mui/icons-material";
import Dropzone from "react-dropzone";
import { convertTextLink } from "../../frequentFunctions";
import DOMPurify from "dompurify";

const RightChat = ({
  messages,
  setMessages,
  user,
  realTime,
  handleFormSubmit,
  setImage,
  setImageError,
  imageError,
  image,
  isNonMobileScreens,
  setMessage,
  message,
  loading,
  token,
  replyMessage,
  setReplyMessage,
}) => {
  const [showImage, setShowImage] = useState(false);
  const [displayEmojiPicker, setDisplayEmojiPicker] = useState(false);
  const [messageId, setMessageId] = useState(null);
  const [imageName, setImageName] = useState("");

  useEffect(() => {
    if (showImage) {
      setIsOverFlow(true);
    } else {
      setIsOverFlow(false);
    }
  }, [showImage]);

  // ----------------------------------------------------------

  const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const testArabic = (text) => {
    return regexArabic.test(text);
  };

  // ----------------------------------------------------------

  const handleEmoji = async (emj, messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}/emoji`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ emoji: emj }),
      });

      const emojis = await response.json();

      setMessages((prev) => {
        return prev?.map((msg) => {
          return msg?._id === messageId ? { ...msg, emoji: emojis } : msg;
        });
      });
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error(error);
      }
    }
  };

  return (
    <Box
      position="relative"
      flex="1"
      mt="50px"
      p={isNonMobileScreens ? "0 75px" : "0 15px"}
      width="100%"
      mb="75px"
    >
      {messages?.map((msg, index) => {
        return (
          <Box key={msg?._id}>
            <Box
              width="100%"
              display="flex"
              justifyContent={msg?.senderId?._id === user._id ? "end" : "start"}
              alignItems="center"
            >
              {msg?.senderId?._id !== user._id && (
                <>
                  {<UserImage size="45" image={msg?.senderId?.picturePath} />}
                </>
              )}

              <Reply
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    display: "flex",
                  },
                  bgcolor: "#2b2d3d",
                  borderRadius: "50%",
                  p: "2px",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  border: "1px solid ##212121",
                  color: "#939393",
                  fontSize: "13px",
                  mx: "5px",
                  order: msg?.senderId?._id === user._id ? -1 : 2,
                }}
                onClick={() => setReplyMessage(msg)}
              />

              <Box
                p={
                  msg?.emoji && Object.values(msg?.emoji)?.length !== 0
                    ? "2px"
                    : "5px"
                }
                width={
                  msg?.emoji && Object.values(msg?.emoji)?.length !== 0
                    ? "unset"
                    : "24px"
                }
                height={
                  msg?.emoji && Object.values(msg?.emoji)?.length !== 0
                    ? "unset"
                    : "24px"
                }
                bgcolor="#2b2d3d"
                borderRadius={
                  msg?.emoji && Object.values(msg?.emoji)?.length > 1
                    ? "4px"
                    : "50%"
                }
                display="flex"
                justifyContent="center"
                alignItems="center"
                border="1px solid ##212121"
                boxShadow="0px 0px 5px 0 #00000029"
                sx={{
                  cursor: "pointer",
                  ":hover": {
                    display: "flex",
                  },
                  order: msg?.senderId?._id === user._id ? -1 : 1,
                }}
                onClick={() => {
                  setDisplayEmojiPicker(!displayEmojiPicker);
                  setMessageId(msg?._id);
                }}
              >
                {msg?.emoji && Object.values(msg?.emoji)?.length !== 0 ? (
                  msg?.emoji &&
                  Object.values(msg?.emoji)?.map((emj) => {
                    return emj;
                  })
                ) : (
                  <EmojiEmotions
                    sx={{
                      color: "#939393",
                      fontSize: "13px",
                    }}
                  />
                )}
              </Box>

              <Box
                m="15px 10px"
                borderRadius="5px"
                maxWidth="65%"
                position="relative"
                bgcolor={
                  msg?.senderId?._id === user._id ? "#3168a2" : "#2b2d3d"
                }
                color="white"
                sx={{
                  wordBreak: "break-word",
                  ":before": {
                    content: "''",
                    position: "absolute",
                    borderTop: `9px solid ${
                      msg?.senderId?._id === user._id ? "#3168a2" : "#2b2d3d"
                    } `,
                    borderRight: "7px solid transparent",
                    borderLeft: "7px solid transparent",
                    borderBottom: "7px solid transparent",
                    transform:
                      msg?.senderId?._id === user._id
                        ? "rotate(-47deg)"
                        : "rotate(40deg)",
                    bottom:
                      msg?.senderId?._id === user._id ? "-8.1px" : "-9.1px",
                    left:
                      msg?.senderId?._id === user._id ? undefined : "-6.4px",
                    right: msg?.senderId?._id === user._id ? "-7px" : undefined,
                  },
                  ":hover": {
                    ".emojiIcon": {
                      display: "flex",
                    },
                  },
                }}
              >
                {msg?.reply && (
                  <Box
                    width="100%"
                    bgcolor="#2b2d3d"
                    display="flex"
                    justifyContent="space-between"
                    borderRadius="5px 5px 0 0"
                    borderLeft={`5px solid ${
                      user._id === msg?.reply?.senderId?._id
                        ? "#3a65a5"
                        : "lightgreen"
                    }`}
                  >
                    <Box
                      display="flex"
                      alignItems="start"
                      gap="5px"
                      flexDirection="column"
                      p="7px"
                      sx={{ userSelect: "none" }}
                    >
                      <Typography
                        color={
                          user._id === msg?.reply?.senderId?._id
                            ? "#527ec0"
                            : "lightGreen"
                        }
                        fontSize="11px"
                        maxWidth="85%"
                        overflow="hidden"
                        whiteSpace="nowrap"
                        textOverflow="ellipsis"
                      >
                        {msg?.reply?.senderId?.firstName}{" "}
                        {msg?.reply?.senderId?.lastName}
                      </Typography>

                      <Typography
                        fontSize="12px"
                        color="#939393"
                        maxWidth="315px"
                        className="truncated-text"
                      >
                        {msg?.reply?.text}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" gap="5px">
                      {msg?.reply?.picturePath && (
                        <img
                          src={msg?.reply?.picturePath}
                          width="64px"
                          height="57px"
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      )}
                    </Box>
                  </Box>
                )}

                {msg?.text && (
                  <Typography
                    p="10px 10px 3px"
                    sx={{ direction: testArabic(msg.text) ? "rtl" : "ltr" }}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(convertTextLink(msg.text), {
                        ADD_ATTR: ["target", "rel"],
                      }),
                    }}
                  />
                )}

                {msg?.picturePath && msg?.picturePath && (
                  <img
                    src={msg?.picturePath}
                    style={{
                      maxWidth: "100%",
                      width: "350px",
                      marginTop: msg?.text ? "6px" : "0",
                      maxHeight: "400px",
                      objectFit: "cover",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                    alt=""
                    onClick={() => {
                      setShowImage(true), setImageName(msg?.picturePath);
                    }}
                  />
                )}

                <Typography
                  color={
                    msg?.senderId?._id === user._id ? "#c4c4c4" : "#939393"
                  }
                  textAlign="right"
                  fontSize="11px"
                  sx={{ userSelect: "none" }}
                  p="7px 10px"
                >
                  {realTime(msg?.createdAt)}
                </Typography>

                {displayEmojiPicker && msg?._id === messageId && (
                  <Box
                    border="1px solid #212121"
                    boxShadow="0px 0px 5px 0 #00000029"
                    borderRadius="40px"
                    position="absolute"
                    zIndex="9999"
                    bottom="15px"
                    left={msg?.senderId?._id === user._id ? undefined : "0"}
                    right={msg?.senderId?._id === user._id ? "0" : undefined}
                    p="6px"
                    bgcolor="#2b2d3d"
                    sx={{ userSelect: "none" }}
                    display="flex"
                    gap="5px"
                  >
                    {["💖", "😂", "😢", "😲", "😡", "🤙"].map((emj, index) => {
                      return (
                        <Box
                          key={index}
                          bgcolor={
                            msg?.emoji[user._id] === emj ? "#8484846e" : ""
                          }
                          borderRadius="50%"
                          p="2px"
                        >
                          <Typography
                            fontSize="27px"
                            sx={{
                              cursor: "pointer",
                              transition: ".3s",
                              ":hover": {
                                transform: "scale(1.2)",
                              },
                            }}
                            onClick={() => {
                              handleEmoji(emj, msg?._id);
                              setDisplayEmojiPicker(false);
                            }}
                          >
                            {emj}
                          </Typography>
                        </Box>
                      );
                    })}
                  </Box>
                )}

                {displayEmojiPicker && (
                  <Box
                    position="fixed"
                    top="0"
                    left="0"
                    width="100%"
                    height="100%"
                    onClick={() => {
                      setDisplayEmojiPicker(false);
                      setMessageId(null);
                    }}
                  />
                )}
              </Box>

              {msg?.senderId?._id === user._id && (
                <UserImage size="45" image={user.picturePath} />
              )}
            </Box>
            {msg?.senderId?._id === user._id &&
              messages?.length - 1 === index &&
              msg?.watched && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap="5px"
                  justifyContent="flex-end"
                  mr="33px"
                  mt="-8px"
                >
                  <Typography
                    color="#939393"
                    textAlign="right"
                    fontSize="11px"
                    mt="-6px"
                    sx={{ userSelect: "none" }}
                  >
                    seen
                  </Typography>

                  <Box>
                    <Check
                      sx={{
                        fontSize: "15px",
                        mb: "2px",
                        color: "#62aeff",
                      }}
                    />

                    <Check
                      sx={{
                        fontSize: "15px",
                        mb: "2px",
                        color: "#62aeff",
                        ml: "-9px",
                      }}
                    />
                  </Box>
                </Box>
              )}

            {msg?.senderId?._id === user._id &&
              messages?.length - 1 === index &&
              !msg?.watched && (
                <Box
                  display="flex"
                  alignItems="center"
                  gap="5px"
                  justifyContent="flex-end"
                  mr="33px"
                  mt="-8px"
                >
                  <Typography
                    color="#939393"
                    textAlign="right"
                    fontSize="11px"
                    mt="-6px"
                    sx={{ userSelect: "none" }}
                  >
                    sent
                  </Typography>

                  <Box>
                    <Check
                      sx={{
                        fontSize: "15px",
                        mb: "2px",
                        color: "#939393",
                      }}
                    />

                    <Check
                      sx={{
                        fontSize: "15px",
                        mb: "2px",
                        color: "#939393",
                        ml: "-9px",
                      }}
                    />
                  </Box>
                </Box>
              )}
          </Box>
        );
      })}

      <Box
        position="fixed"
        bottom="-1px"
        left={isNonMobileScreens ? "287px" : "0"}
        display="flex"
        flexDirection="column"
        alignItems="center"
        sx={{
          width: isNonMobileScreens ? "80%" : "100%",
        }}
      >
        {replyMessage && (
          <Box
            width={isNonMobileScreens ? "75%" : "100%"}
            bgcolor="#2b2d3d"
            display="flex"
            justifyContent="space-between"
            borderRadius="5px 5px 0 0"
            borderLeft={`5px solid ${
              user._id === replyMessage?.senderId?._id
                ? "#3a65a5"
                : "lightgreen"
            }`}
          >
            <Box
              display="flex"
              alignItems="start"
              gap="5px"
              flexDirection="column"
              p="7px"
              sx={{ userSelect: "none" }}
            >
              <Typography
                color={
                  user._id === replyMessage?.senderId?._id
                    ? "#527ec0"
                    : "lightGreen"
                }
                fontSize="11px"
              >
                {replyMessage?.senderId?.firstName}{" "}
                {replyMessage?.senderId?.lastName}
              </Typography>

              <Typography
                fontSize="12px"
                color="#939393"
                maxWidth="315px"
                className="truncated-text"
              >
                {replyMessage?.text}
              </Typography>
            </Box>

            <Box display="flex" alignItems="center" gap="5px">
              {replyMessage?.picturePath && (
                <img
                  src={replyMessage?.picturePath}
                  width="64px"
                  height="57px"
                  style={{ objectFit: "cover" }}
                  alt=""
                />
              )}

              <IconButton onClick={() => setReplyMessage(null)}>
                <Close
                  sx={{
                    color: "#939393",
                    fontSize: "17px",
                  }}
                />
              </IconButton>
            </Box>
          </Box>
        )}

        <form
          style={{
            width: "100%",
            height: "75px",
            textAlign: "center",
            backgroundColor: "#20232d",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8px 0",
          }}
          onSubmit={handleFormSubmit}
        >
          <Box sx={{ cursor: "pointer" }}>
            <Dropzone
              accept=".jpg,.jpeg,.png,.webp"
              multiple={false}
              onDrop={(acceptedFiles) => {
                const file = acceptedFiles[0];
                const fileExtension = file.name.split(".").pop().toLowerCase();
                if (["jpg", "jpeg", "png", "webp"].includes(fileExtension)) {
                  setImage(file);
                  setImageError(null);
                } else if (
                  !["jpg", "jpeg", "png", "webp"].includes(fileExtension)
                ) {
                  setImageError("This file is not supported");
                }
              }}
            >
              {({ getRootProps, getInputProps }) => (
                <Box {...getRootProps()} position="relative">
                  <input {...getInputProps()} />

                  <IconButton style={{ marginRight: "5px" }}>
                    <Image
                      className={imageError && "wrongImage"}
                      sx={{ color: "#4281d7" }}
                    />
                  </IconButton>

                  {image && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageError(null);
                        setImage(null);
                      }}
                      sx={{
                        position: "absolute",
                        top: "-15px",
                        right: "-7px",
                      }}
                    >
                      <DeleteOutlined
                        sx={{
                          fontSize: "23px",
                          color: "white",
                          background: "#dc3c3c75",
                          borderRadius: "50%",
                          padding: "2px",
                        }}
                      />
                    </IconButton>
                  )}
                </Box>
              )}
            </Dropzone>
          </Box>

          <input
            type="text"
            style={{
              width: isNonMobileScreens ? "60%" : "90%",
              padding: "14px 10px",
              outline: "none",
              border: "none",
              fontFamily: "Rubik,sans-serif",
              zIndex: "1",
              background: "#171723",
              color: "white",
              borderRadius: "5px",
              direction: testArabic(message) ? "rtl" : "ltr",
            }}
            placeholder="write a message..."
            onChange={(e) => {
              if (e.target.value.length > 1500) {
                setMessage(e.target.value.slice(0, 1480));
              } else {
                setMessage(e.target.value);
              }
            }}
            value={message}
            disabled={loading}
          />

          <IconButton
            type="submit"
            sx={{ background: "#4281d7", marginLeft: "7px" }}
            disabled={loading}
          >
            {!loading ? (
              <Send style={{ color: "black" }} />
            ) : (
              <Box
                className="loadingAnimation"
                width="20px"
                height="20px"
              ></Box>
            )}
          </IconButton>
        </form>
      </Box>

      {showImage && (
        <OpenPhoto photo={imageName} setIsImagOpen={setShowImage} />
      )}
    </Box>
  );
};

export default RightChat;
