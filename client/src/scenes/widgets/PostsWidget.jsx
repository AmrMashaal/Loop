/* eslint-disable react-hooks/exhaustive-deps */
import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PostClick from "../../components/post/PostClick";
import PostWidget from "./PostWidget";
import { setPosts } from "../../../state/index";
import { debounce } from "lodash";
import _ from "lodash";
import { setIsOverFlow } from "../../App";

// eslint-disable-next-line react/prop-types
const PostsWidget = ({ socket, newPosts: newPostsData = {} }) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [isPostClicked, setIsPostClicked] = useState(false);
  const [postLoading, setPostLoading] = useState(true);
  const [postClickData, setPostClickData] = useState({
    picturePath: "",
    firstName: "",
    lastName: "",
    userPicturePath: "",
    description: "",
    _id: "",
    userId: "",
    verified: false,
  });
  const posts = useSelector((state) => state.posts);
  const token = useSelector((state) => state.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isPostClicked) {
      setIsOverFlow(true);
    } else {
      setIsOverFlow(false);
    }
  }, [isPostClicked]);

  useEffect(() => {
    dispatch(setPosts({ posts: [] }));
  }, []);

  function uiqueIt(data) {
    return _.uniqBy(data, "_id");
  }

  async function getPosts(reset = false) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/posts/feed?page=${pageNumber}&limit=${
          10 + newPostsData.length
        }`,
        {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const newPosts = await response.json();

      if (reset) {
        dispatch(setPosts({ posts: uiqueIt(newPosts) }));
      } else if (newPostsData.length === 0) {
        dispatch(setPosts({ posts: uiqueIt([...posts, ...newPosts]) }));
      } else {
        dispatch(
          setPosts({ posts: uiqueIt([...posts, ...newPosts, ...newPostsData]) })
        );
      }
    } catch (error) {
      console.log(error);
    } finally {
      setPostLoading(false);
    }
  }

  useEffect(() => {
    if (pageNumber === 1) {
      getPosts(true);
    } else {
      getPosts();
    }
  }, [pageNumber]);

  const getMorePosts = () => {
    setPageNumber((prevNum) => prevNum + 1);
  };

  useEffect(() => {
    const handleScroll = debounce(() => {
      if (
        window.scrollY + window.innerHeight >=
        document.body.offsetHeight - 3
      ) {
        getMorePosts();
      }
    }, 300);

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <Box>
      {isPostClicked && (
        <PostClick
          picturePath={postClickData.picturePath}
          firstName={postClickData.firstName}
          lastName={postClickData.lastName}
          userPicturePath={postClickData.userPicturePath}
          description={postClickData.description}
          setIsPostClicked={setIsPostClicked}
          _id={postClickData._id}
          userId={postClickData.userId}
          verified={postClickData.verified}
        />
      )}

      <PostWidget
        posts={posts}
        postClickData={postClickData}
        setPostClickData={setPostClickData}
        isPostClicked={isPostClicked}
        setIsPostClicked={setIsPostClicked}
        postLoading={postLoading}
        socket={socket}
      />
    </Box>
  );
};

export default PostsWidget;
