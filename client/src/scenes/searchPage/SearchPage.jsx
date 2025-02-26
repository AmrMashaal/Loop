import { Box } from "@mui/system";
import Navbar from "../navbar";
import SearchThings from "../../components/search/SearchThings";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import WrongPassword from "../../components/WrongPassword";

const SearchPage = () => {
  const [type, setType] = useState("user");
  const [users, setUsers] = useState({});
  const [posts, setPosts] = useState({});
  const [loading, setLoading] = useState(true);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [page, setPage] = useState(1);

  const controllerRef = useRef(null);

  const { searchValue } = useParams();
  const encodedSearch = encodeURIComponent(searchValue);

  const mode = useSelector((state) => state.mode);
  const token = useSelector((state) => state.token);
  const user = useSelector((state) => state.user);

  document.title = `search - ${searchValue}`;

  const handleSearch = async (reset = false) => {
    setLoading(true);

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    controllerRef.current = new AbortController();

    try {
      const response = await fetch(
        `/api/search/${type}s/${encodedSearch}?page=${page}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controllerRef.current.signal,
        }
      );

      const dataResponsed = await response.json();

      if (type === "post") {
        if (reset) {
          setPosts(dataResponsed);
        } else {
          setPosts((prevPosts) => {
            return {
              data: [...prevPosts.data, ...dataResponsed.data],
              count: dataResponsed.count,
            };
          });
        }
      } else if (type === "user") {
        if (reset) {
          setUsers(dataResponsed);
        } else {
          setUsers((prevData) => {
            return {
              data: [
                ...prevData.data,
                ...dataResponsed.data.filter((user) => {
                  return !prevData.data.some(
                    (oldUser) => oldUser._id === user._id
                  );
                }),
              ],
              count: dataResponsed.count,
            };
          });
        }
      }
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 1) {
      handleSearch(true);
    } else {
      handleSearch();
    }
  }, [searchValue, type, page]);

  useEffect(() => {
    setPosts({});
    setUsers({});
    setPage(1);
  }, [searchValue, type]);

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
  }, []);

  return (
    <Box>
      <Box
        position="fixed"
        width="800px"
        height="800px"
        borderRadius="50%"
        boxShadow="0 0 20px 20px rgb(27 102 176 / 19%)"
        top="-200px"
        left="-172px"
        zIndex="10"
        sx={{
          opacity: mode === "light" ? "0.1" : "0.07",
          background:
            "radial-gradient(circle, rgb(30 144 255 / 65%), rgb(17 17 17 / 0%))",
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
        zIndex="10"
        sx={{
          opacity: mode === "light" ? "0.1" : "0.1",
          background:
            "radial-gradient(circle, rgb(255 31 223 / 63%), rgb(17 17 17 / 0%))",
          pointerEvents: "none",
        }}
      ></Box>

      <Navbar />

      <SearchThings
        searchValue={searchValue}
        type={type}
        setType={setType}
        data={type === "user" ? users : posts}
        loading={loading}
        setPage={setPage}
      />
      {wrongPassword && <WrongPassword />}
    </Box>
  );
};

export default SearchPage;
