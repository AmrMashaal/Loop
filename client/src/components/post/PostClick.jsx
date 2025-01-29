/* eslint-disable react/prop-types */
import { Divider, IconButton, Typography } from "@mui/material";
import { Box, useMediaQuery, useTheme } from "@mui/system";
import UserImage from "./../UserImage";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  // ChatBubbleOutlineOutlined,
  // FavoriteBorderOutlined,
  // FavoriteOutlined,
  // ShareOutlined,
  CloseOutlined,
  VerifiedOutlined,
} from "@mui/icons-material";
import Comments from "./Comments";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Navbar from "../../scenes/navbar";

const PostClick = ({
  setIsPostClicked,
  picturePath: initialPicturePath,
  firstName: initialFirstName,
  lastName: initialLastName,
  userPicturePath: initialUserPicturePath,
  description: initialDescription,
  _id: initialId,
  userId: initialUserId,
  verified: initialVerified,
}) => {
  const [postDetails, setPostDetails] = useState({
    //  the idea is the state copy the value of the props if it does not have values and change it when fetching exists
    picturePath: initialPicturePath,
    firstName: initialFirstName,
    lastName: initialLastName,
    userPicturePath: initialUserPicturePath,
    description: initialDescription,
    _id: initialId,
    userId: initialUserId,
    verified: initialVerified,
  });
  const [isDeletedPost, setIsDeletedPost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postId, setPostId] = useState(null);

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  const { palette } = useTheme();
  const medium = palette.neutral.medium;

  const token = useSelector((state) => state.token);

  const { id } = useParams();

  const location = useLocation();

  const handlePostForLink = async () => {
    if (location.pathname.split("/")[1] === "post" && postId) {
      setLoading(true);

      setPostDetails({
        picturePath: initialPicturePath,
        firstName: initialFirstName,
        lastName: initialLastName,
        userPicturePath: initialUserPicturePath,
        description: initialDescription,
        _id: initialId,
        userId: initialUserId,
        verified: initialVerified,
      });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/posts/${postId}`,
          {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setPostDetails({
            picturePath: data.picturePath,
            firstName: data.firstName,
            lastName: data.lastName,
            userPicturePath: data.userPicturePath,
            description: data.description,
            _id: data._id,
            userId: data.userId,
            verified: data.verified,
          });

          setIsDeletedPost(false);
        } else {
          setIsDeletedPost(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    setPostId(id?.split("-anotherId-")[0]);
  }, [id]);

  useEffect(() => {
    handlePostForLink();
  }, [postId]);

  const regexArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/;
  const testArabic = regexArabic.test(postDetails.description);

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      width="100%"
      height="100%"
      display="flex"
      justifyContent="center"
      alignItems="center"
      zIndex="11111111111"
    >
      {location.pathname.split("/")[1] !== "post" && (
        <Box
          onClick={() => setIsPostClicked(false)}
          bgcolor="#00000091"
          width="100%"
          height="101%"
          position="absolute"
        ></Box>
      )}

      <Box
        width={isNonMobileScreens ? "90%" : "100%"}
        py={isNonMobileScreens ? "10px" : "0"}
        margin={isNonMobileScreens ? "auto" : "0"}
        display="flex"
        justifyContent="center"
        flexDirection={isNonMobileScreens ? "row" : "column"}
        overflow={isNonMobileScreens ? "unset" : "auto"}
        maxHeight="100%"
        height={isNonMobileScreens ? undefined : "100%"}
      >
        {postDetails.picturePath && (
          <Box
            bgcolor="black"
            sx={{
              zIndex: "1",
              maxHeight: isNonMobileScreens ? "550px" : undefined,
              height: isNonMobileScreens ? undefined : "300px",
              minHeight: isNonMobileScreens ? "550px" : undefined,
              boxShadow:
                location.pathname.split("/")[1] === "post"
                  ? "-17px 18px 15px 0px #0000001c"
                  : undefined,
            }}
          >
            <img
              src={`${import.meta.env.VITE_API_URL}/assets/${
                postDetails.picturePath
              }`}
              title={postDetails.picturePath}
              style={{
                objectFit: "contain",
                height: "100%",
                width: isNonMobileScreens ? "700px" : "100%",
                maxWidth: "100%",
                //   maxHeight: isNonMobileScreens ? undefined : "500px",
                margin: isNonMobileScreens ? "auto" : undefined,
                display: isNonMobileScreens ? "block" : undefined,
              }}
            />
          </Box>
        )}

        {/* ----------------Information---------------- */}

        <Box
          bgcolor={palette.neutral.light}
          p="10px 28px"
          width={isNonMobileScreens ? "400px" : "100%"}
          sx={{
            maxWidth: "100%",
            zIndex: "1",
            maxHeight: isNonMobileScreens ? "550px" : undefined,
            height: isNonMobileScreens ? undefined : "380px",
            minHeight: isNonMobileScreens ? "550px" : undefined,
            overflow: "auto",
            flex: isNonMobileScreens ? undefined : "1",
            boxShadow:
              location.pathname.split("/")[1] === "post"
                ? "-17px 18px 15px 0px #0000001c"
                : undefined,
          }}
          id="commentsParent"
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            position="sticky"
            top="-11px"
            zIndex="11"
            p="4px 0"
            bgcolor={palette.neutral.light}
          >
            <Link
              to={postDetails.userId && `/profile/${postDetails.userId}`}
              className="opacityBox"
            >
              <Box
                display="flex"
                alignItems="center"
                gap="10px"
                sx={{
                  cursor: "pointer",
                }}
              >
                <UserImage image={postDetails.userPicturePath} size="50px" />
                <Box display="flex" gap="5px" alignItems="center">
                  <Typography sx={{ transition: ".3s" }}>
                    {postDetails.firstName && !isDeletedPost
                      ? postDetails.firstName
                      : isDeletedPost
                      ? "Unknown 👽👽"
                      : "loading..."}{" "}
                    {postDetails.lastName}
                  </Typography>
                  {postDetails.verified && (
                    <VerifiedOutlined
                      sx={{ fontSize: "22px", color: "#00D5FA" }}
                    />
                  )}
                </Box>
              </Box>
            </Link>
            {location.pathname.split("/")[1] !== "post" && (
              <Box
                onClick={(e) => {
                  e.stopPropagation(), setIsPostClicked(false);
                }}
              >
                <IconButton>
                  <CloseOutlined />
                </IconButton>
              </Box>
            )}
          </Box>

          <Typography
            fontSize="16px"
            lineHeight="27px"
            my="10px"
            sx={{
              wordWrap: "break-word",
              overflowX: "auto",
              direction: testArabic ? "rtl" : "ltr",
            }}
          >
            {postDetails?.description}
          </Typography>

          <Divider />
          {postDetails.firstName && (
            <Typography
              m="9px 0px 5px"
              color={medium}
              fontSize="12px"
              fontWeight="bold"
              sx={{ userSelect: "none" }}
            >
              comments
            </Typography>
          )}

          {postDetails.firstName && !loading && (
            <Comments
              _id={postDetails._id}
              userId={postDetails.userId}
              comIdParam={id?.split("-anotherId-")[1]}
            />
          )}

          {location.pathname.split("/")[1] === "post" && isNonMobileScreens && (
            <Navbar />
          )}
          {isDeletedPost && <Typography>This post has been deleted</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default PostClick;
