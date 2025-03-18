if (import.meta.env.VITE_NODE_ENV === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import SearchPage from "./scenes/searchPage/SearchPage";
import ChatPage from "./scenes/chatPage/ChatPage";
import PostClick from "./components/post/PostClick";
import { setFriends } from "../state";
import socket from "./components/socket";

export let isOverflow;
export let setIsOverFlow;

export let posts;
export let setPosts;

const App = () => {
  const [newPosts, setNewPosts] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  [posts, setPosts] = useState([]);
  [isOverflow, setIsOverFlow] = useState(false);

  useEffect(() => {
    if (isOverflow) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  }, [isOverflow]);

  const isAuth = Boolean(useSelector((state) => state.user));

  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  const dispatch = useDispatch();

  const handleUserFriend = async () => {
    try {
      const response = await fetch(
        `/api/friends/${user?._id}/friends?app=true`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const friends = await response.json();

      const friendsIds = friends?.map((ele) => {
        return ele.sender === user._id ? ele.receiver : ele.sender;
      });

      dispatch(setFriends({ friends: friendsIds }));
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  useEffect(() => {
    if (user) {
      handleUserFriend();
    }
  }, []);

  useEffect(() => {
    if (import.meta.env.VITE_NODE_ENV !== "production") {
      if (user) {
        socket.on("notification", (data) => {
          setNewPosts((prevPosts) => (prevPosts ? [...prevPosts, data] : data));
        });

        if (
          user?.friends?.length !== 0 &&
          import.meta.env.VITE_NODE_ENV !== "production"
        ) {
          socket.emit("userOnline", {
            userId: user?._id,
            friends: user.friends,
          });
        }

        return () => {
          socket.off("notification");
          socket.off("userOnline");
        };
      }
    }
  }, [socket]);

  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route
              path="/login"
              element={!isAuth ? <LoginPage /> : <Navigate to="/" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/signup"
              element={!isAuth ? <LoginPage /> : <Navigate to="/" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/"
              element={
                isAuth ? (
                  <HomePage
                    socket={socket}
                    newPosts={newPosts}
                    setNewPosts={setNewPosts}
                    onlineFriends={onlineFriends}
                    setOnlineFriends={setOnlineFriends}
                    posts={posts}
                    setPosts={setPosts}
                  />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/profile/:userId"
              element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/profile/:userId/about"
              element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/profile/:userId/friends"
              element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/profile/:userId/badges"
              element={isAuth ? <ProfilePage /> : <Navigate to="/login" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/search/:searchValue"
              element={isAuth ? <SearchPage /> : <Navigate to="/login" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/chat/:userId"
              element={
                isAuth ? <ChatPage socket={socket} /> : <Navigate to="/login" />
              }
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/chat"
              element={
                isAuth ? (
                  <ChatPage socket={socket} fromNav={true} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="*"
              element={isAuth ? <Navigate to="/" /> : <Navigate to="/login" />}
            />
            {/* -------------------------------------------------------- */}
            <Route
              path="/post/:id"
              element={isAuth ? <PostClick /> : <Navigate to="/login" />}
            />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
};

export default App;
