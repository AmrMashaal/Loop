/* eslint-disable react/prop-types */
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Box, debounce, useMediaQuery } from "@mui/material";
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import ChatNavbar from "./ChatNavbar";
import RightChat from "./RightChat";
import LeftChat from "./LeftChat";
import { ArrowDownward } from "@mui/icons-material";
import ChatSkeleton from "../skeleton/ChatSkeleton";
import WrongPassword from "../../components/WrongPassword";

// eslint-disable-next-line react/prop-types
const ChatPage = ({ socket, fromNav }) => {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [image, setImage] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [imageError, setImageError] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [historyLoad, setHistoryLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [showSroll, setShowSroll] = useState(false);
  const [messages, setMessages] = useState([]);
  const [lastMessageData, setLastMessageData] = useState([]);

  const { userId } = useParams();

  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);
  const mode = useSelector((state) => state.mode);

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const startNotificationSound = () => {
    const audioId = document.getElementById("messageNotificationSound");

    audioId.play();
  };

  const getMessages = async (reset = false) => {
    try {
      const response = await fetch(
        `/api/messages/${user._id}/${userId}?page=${pageNumber}&limit=50`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const messages = await response.json();

      const reversedMessages = messages.reverse();

      console.log(reversedMessages)

      if (reset) {
        setMessages(reversedMessages);
      } else {
        setMessages((prevMessages) => [...reversedMessages, ...prevMessages]);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setInitialLoad(false);
    }
  };

  const decryptMessage = (message) => {
    const decryptedMessage = CryptoJS.AES.decrypt(
      message,
      import.meta.env.VITE_MESSAGE_SECRET
    );

    return decryptedMessage.toString(CryptoJS.enc.Utf8);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      message.trim().length !== 0 ||
      image.length !== 0 ||
      message.length > 1500
    ) {
      setLoading(true);

      const formData = new FormData();

      formData.append("text", message);

      if (image) {
        formData.append("picture", image);
        formData.append("picturePath", image.name);
      }

      try {
        const response = await fetch(`/api/messages/${user._id}/${userId}`, {
          method: "POST",

          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const messagesResponse = await response.json();

        if (import.meta.env.VITE_NODE_ENV !== "production") {
          socket.emit("sendMessage", {
            receiverId: userId,
            message: messagesResponse,
          });
        }

        setMessages((prevMessages) => [...prevMessages, messagesResponse]);
      } catch (error) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", error);
        }
      } finally {
        setImage("");
        setMessage("");
        setLoading(false);
      }
    }
  };

  const realTime = (time) => {
    const data = new Date(time);

    const dataString = data.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    });

    return dataString;
  };

  const handleLastMessages = async () => {
    setHistoryLoad(true);

    try {
      const response = await fetch(`/api/lastMessages`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const lastMessages = await response.json();

      setLastMessageData(lastMessages);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setHistoryLoad(false);
    }
  };

  const getMoreMessages = () => {
    setPageNumber((prevNum) => prevNum + 1);
  };

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (window.scrollY <= 3) {
        getMoreMessages();
      }
    }, 500);

    const handleShowScrollButton = () => {
      if (
        window.scrollY + window.innerHeight + 100 >=
          document.body.offsetHeight ===
        false
      ) {
        setShowSroll(true);
      } else {
        setShowSroll(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("scroll", handleShowScrollButton);
    return () => {
      handleScroll.clear();
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleShowScrollButton);
    };
  }, []);

  useEffect(() => {
    if (import.meta.env.VITE_NODE_ENV !== "production") {
      const handleReceiveMessage = (data) => {
        if (data?.senderId?._id === userId) {
          setMessages((prevMessages) => [...prevMessages, data]);
        } else if (data?.senderId?._id !== userId) {
          startNotificationSound();
        }

        // setLastMessageData((prevHistory) => {
        //   return prevHistory.map((ele) => {
        //     return ele?.senderId?._id === data?.senderId?._id ||
        //       ele.receiverId._id === data.senderId._id
        //       ? {
        //           ...ele,
        //           message: data.text,
        //           updatedAt: data.updatedAt,
        //           senderId: {
        //             ...ele.senderId,
        //             _id: data.senderId._id,
        //           },
        //         }
        //       : ele;
        //   });
        // });
      };

      socket.on("receiveMessage", handleReceiveMessage);

      return () => {
        socket.off("receiveMessage", handleReceiveMessage);
      };
    }
  }, [socket, userId]);

  useEffect(() => {
    setPageNumber(1);

    if (!initialLoad) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [userId, initialLoad]);

  useEffect(() => {
    if (pageNumber === 1) {
      getMessages(true);
    } else {
      getMessages();
    }
  }, [userId, pageNumber]);

  const checkCorrectPassword = async () => {
    try {
      const response = await fetch(
        `/api/users/${user._id}/checkCorrectPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ passwordChangedAt: user.passwordChangedAt }),
        }
      );

      const result = await response.json();

      if (result.message === "Password is not correct") {
        setWrongPassword(true);
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    checkCorrectPassword();
    handleLastMessages();
  }, []);

  const handleFormSubmit = async (e) => {
    handleSubmit(e);

    if (
      (message.trim().length !== 0 && userId !== user._id) ||
      (image?.length !== 0 && message?.length < 1500 && userId !== user._id)
    ) {
      try {
        const sendMessageResponse = await fetch(
          `/api/notifications/${user._id}/${userId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              type: "message",
              description: `${user.firstName} sent you a message`,
              linkId: user._id,
              receiverId: userId,
              senderId: user._id,
            }),
          }
        );

        const data = await sendMessageResponse.json();

        if (import.meta.env.VITE_NODE_ENV !== "production") {
          socket.emit("notifications", {
            receiverId: userId,
            notification: data,
          });
        }

        await fetch(`/api/lastMessages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            senderId: user._id,
            receiverId: userId,
            message: message,
          }),
        });

        // if (userId !== user._id) {
        //   setLastMessageData((prevHistory) => {
        //     return prevHistory.map((ele) => {
        //       return data?.receiverId?._id === ele?.senderId?._id ||
        //         data?.receiverId?._id === ele?.receiverId?._id
        //         ? {
        //             ...ele,
        //             message: message,
        //             updatedAt: data?.updatedAt,
        //             senderId: {
        //               ...ele?.receiverId,
        //               _id: user._id,
        //             },
        //           }
        //         : ele;
        //     });
        //   });
        // }
      } catch (error) {
        if (import.meta.env.VITE_NODE_ENV === "development") {
          console.error("Error:", error);
        }
      }
    }
  };

  useEffect(() => {
    if (title.length !== 0) {
      document.title = title;
    }
  }, [title]);

  useEffect(() => {
    setInitialLoad(true);
  }, [userId]);

  return (
    <Box margin="auto" id="chatBox">
      <Box
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(27 102 176 / 19%)"
        top="-200px"
        left="-172px"
        zIndex="100"
        sx={{
          opacity: "0.07",
          background:
            "radial-gradient(circle, rgb(30 144 255), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

      <Box
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(255 31 198 / 13%)"
        bottom="-200px"
        right="-172px"
        zIndex="100"
        sx={{
          opacity: "0.1",
          background:
            "radial-gradient(circle, rgb(255 31 223 / 63%), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

      <Box
        position="fixed"
        width="100%"
        height="100%"
        zIndex="-2"
        bgcolor="#20232d"
        top="0"
        left="0"
      ></Box>

      <audio
        id="messageNotificationSound"
        src="\assets\sound_effect_4 (mp3cut.net).mp3"
        preload="auto"
      ></audio>

      <ChatNavbar
        lastMessageData={lastMessageData}
        userParam={userId}
        fromNav={fromNav}
      />

      <Box position="relative" display="flex">
        {(fromNav || isNonMobileScreens) && (
          <LeftChat
            isNonMobileScreens={isNonMobileScreens}
            historyLoad={historyLoad}
            lastMessageData={lastMessageData}
            setLastMessageData={setLastMessageData}
            user={user}
            setTitle={setTitle}
            userId={userId}
          />
        )}

        {userId && !initialLoad && (
          <RightChat
            messages={messages}
            user={user}
            mode={mode}
            decryptMessage={decryptMessage}
            realTime={realTime}
            lastMessageData={lastMessageData}
            historyLoad={historyLoad}
            handleFormSubmit={handleFormSubmit}
            setImage={setImage}
            setImageError={setImageError}
            imageError={imageError}
            image={image}
            isNonMobileScreens={isNonMobileScreens}
            setMessage={setMessage}
            message={message}
            loading={loading}
          />
        )}

        {initialLoad && userId && pageNumber === 1 && (
          <ChatSkeleton isNonMobileScreens={isNonMobileScreens} />
        )}

        {userId && (
          <Box
            position="fixed"
            bottom="100px"
            bgcolor="white"
            color="black"
            right={isNonMobileScreens ? "180px" : "15px"}
            p="5px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            borderRadius="50%"
            sx={{
              cursor: "pointer",
              opacity: showSroll ? ".6" : "0",
              visibility: showSroll ? "unset" : "hidden",
              transition: ".3s",
              ":hover": {
                opacity: "1",
              },
            }}
            onClick={() =>
              window.scrollTo({
                top: document.body.scrollHeight,
                behavior: "smooth",
              })
            }
          >
            <ArrowDownward />
          </Box>
        )}
      </Box>

      {wrongPassword && <WrongPassword />}
    </Box>
  );
};

export default ChatPage;
