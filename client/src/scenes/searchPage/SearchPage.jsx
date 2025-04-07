import { Box, useMediaQuery } from "@mui/system";
import Navbar from "../navbar";
import SearchThings from "../../components/search/SearchThings";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import WrongPassword from "../../components/WrongPassword";
import { setPosts } from "../../App";

const SearchPage = () => {
  const [type, setType] = useState("user");
  const [users, setUsers] = useState({});
  const [postsFetch, setPostsFetch] = useState({});
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
          setPostsFetch(dataResponsed);
          setPosts(dataResponsed.data);
        } else {
          setPostsFetch((prevPosts) => {
            return {
              data: [...prevPosts.data, ...dataResponsed.data],
              count: dataResponsed.count,
            };
          });

          setPosts((prevPosts) => [...prevPosts, ...dataResponsed.data]);
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
    setPostsFetch({});
    setPosts([]);
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

  const isNonMobileScreens = useMediaQuery("(min-width:1000px)");

  useEffect(() => {
    checkCorrectPassword();
  }, []);

  return (
    <Box mb={!isNonMobileScreens ? "71px" : ""}>
      <Navbar />

      <SearchThings
        searchValue={searchValue}
        type={type}
        setType={setType}
        data={type === "user" ? users : postsFetch}
        loading={loading}
        setPage={setPage}
      />
      {wrongPassword && <WrongPassword />}
    </Box>
  );
};

export default SearchPage;
