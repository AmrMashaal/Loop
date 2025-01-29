import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import HomePage from "./scenes/homePage";
import LoginPage from "./scenes/loginPage";
import ProfilePage from "./scenes/profilePage";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";
import SearchPage from "./scenes/searchPage/SearchPage";
import ChatPage from "./scenes/chatPage/ChatPage";
import socket from "./components/socket";
import PostClick from "./components/post/PostClick";

const App = () => {
  const [newPosts, setNewPosts] = useState([]);
  const [onlineFriends, setOnlineFriends] = useState([]);
  const [userFriends, setUserFriends] = useState([]);

  const isAuth = Boolean(useSelector((state) => state.user));

  const mode = useSelector((state) => state.mode);
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);

  const handleUserFriend = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/friends/${user._id}/friends`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const friends = await response.json();

      setUserFriends(friends);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleUserFriend();
  }, []);

  useEffect(() => {
    socket.on("notification", (data) => {
      setNewPosts((prevPosts) => (prevPosts ? [...prevPosts, data] : data));
    });

    socket.emit("userOnline", { userId: user?._id, friends: userFriends });

    return () => {
      socket.off("notification");
      socket.off("userOnline");
    };
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
