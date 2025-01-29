import { Box } from "@mui/system";
import Navbar from "../navbar";
import SearchThings from "../../components/search/SearchThings";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setPosts } from "../../../state";
import WrongPassword from "../../components/WrongPassword";

const SearchPage = () => {
  const [type, setType] = useState("users");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wrongPassword, setWrongPassword] = useState(false);
  const [page, setPage] = useState(1);

  const controllerRef = useRef(null);
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.posts);

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
        `${
          import.meta.env.VITE_API_URL
        }/search/${type}/${encodedSearch}?page=${page}`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controllerRef.current.signal,
        }
      );

      const dataResponsed = await response.json();

      if (type === "posts") {
        if (reset) {
          dispatch(setPosts({ posts: dataResponsed }));
        } else {
          dispatch(setPosts({ posts: [...posts, ...dataResponsed] }));
        }
      } else if (type === "users") {
        setData((prevData) => [
          ...prevData,
          ...dataResponsed.filter((user) => {
            return !prevData.some((oldUser) => oldUser._id === user._id);
          }),
        ]);
      }
    } catch (error) {
      console.log(error);
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
    setData([]);
    setPage(1);
  }, [searchValue, type]);

  const checkCorrectPassword = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${
          user._id
        }/checkCorrectPassword`,
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
      console.log(error);
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
        data={type === "users" ? data : posts}
        loading={loading}
        setPage={setPage}
      />
      {wrongPassword && <WrongPassword />}
    </Box>
  );
};

export default SearchPage;
