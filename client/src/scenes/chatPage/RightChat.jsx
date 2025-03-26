/* eslint-disable react/prop-types */
import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import UserImage from "../../components/UserImage";
import OpenPhoto from "../../components/OpenPhoto";
import { setIsOverFlow } from "../../App";
import { DeleteOutlined, Image, Send } from "@mui/icons-material";
import Dropzone from "react-dropzone";
import { convertTextLink } from "../../frequentFunctions";
import DOMPurify from "dompurify";

const RightChat = ({
  messages,
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
}) => {
  const [showImage, setShowImage] = useState(false);
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

  return (
    <Box
      position="relative"
      flex="1"
      mt="50px"
      p={isNonMobileScreens ? "0 75px" : "0 15px"}
      width="100%"
      mb="75px"
    >
      {messages?.map((msg) => {
        return (
          <Box
            key={msg?._id}
            width="100%"
            display="flex"
            justifyContent={msg?.senderId?._id === user._id ? "end" : "start"}
            alignItems="center"
          >
            {msg?.senderId?._id !== user._id && (
              <>{<UserImage size="45" image={msg?.senderId?.picturePath} />}</>
            )}

            <Box
              m="15px 10px"
              borderRadius="5px"
              maxWidth="65%"
              position="relative"
              bgcolor={msg?.senderId?._id === user._id ? "#3168a2" : "#2b2d3d"}
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
                  bottom: msg?.senderId?._id === user._id ? "-8.1px" : "-9.1px",
                  left: msg?.senderId?._id === user._id ? undefined : "-6.4px",
                  right: msg?.senderId?._id === user._id ? "-7px" : undefined,
                },
              }}
            >
              {msg?.text && (
                <Typography
                  p="10px 10px 3px"
                  sx={{ direction: testArabic(msg.text) ? "rtl" : "ltr" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      convertTextLink(
                        msg?.text.length > 180
                          ? msg?.text.slice(0, 179)
                          : msg.text
                      ),
                      {
                        ADD_ATTR: ["target", "rel"],
                      }
                    ),
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
                color={msg?.senderId?._id === user._id ? "#c4c4c4" : "#939393"}
                textAlign="right"
                fontSize="11px"
                sx={{ userSelect: "none" }}
                p="7px 10px"
              >
                {realTime(msg?.createdAt)}
              </Typography>
            </Box>

            {msg?.senderId?._id === user._id && (
              <UserImage size="45" image={user.picturePath} />
            )}
          </Box>
        );
      })}

      <form
        style={{
          width: isNonMobileScreens ? "80%" : "100%",
          position: "fixed",
          bottom: "-1px",
          height: "75px",
          left: isNonMobileScreens ? "287px" : "50%",
          textAlign: "center",
          backgroundColor: "#20232d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 8px 0",
          transform: !isNonMobileScreens && "translateX(-50%)",
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
          <Send style={{ color: "black" }} />
        </IconButton>
      </form>

      {showImage && (
        <OpenPhoto photo={imageName} setIsImagOpen={setShowImage} />
      )}
    </Box>
  );
};

export default RightChat;
