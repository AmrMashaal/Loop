/* eslint-disable react/prop-types */
import { useTheme } from "@emotion/react";
import { Button, Typography } from "@mui/material";
import { Box, useMediaQuery } from "@mui/system";
import { Link } from "react-router-dom";
import UserImage from "../UserImage";
import { CommentSharp, People, VerifiedOutlined } from "@mui/icons-material";
import SearchSkeleton from "../../scenes/skeleton/SearchSkeleton";
import PostWidget from "../../scenes/widgets/PostWidget";
import { useState } from "react";
import PostClick from "../post/PostClick";

// eslint-disable-next-line react/prop-types
const SearchThings = ({
  searchValue,
  type,
  setType,
  data,
  loading,
  setPage,
}) => {
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
  const [postClicType, setPostClickType] = useState("");
  const [isPostClicked, setIsPostClicked] = useState(false);

  const theme = useTheme();
  const medium = theme.palette.neutral.medium;
  const alt = theme.palette.background.alt;

  const isNonMobileScreens = useMediaQuery("(min-width: 1000px)");

  return (
    <Box className="homeContainer">
      <Box
        display="flex"
        gap="20px"
        flexDirection={isNonMobileScreens ? "row" : "column"}
      >
        {/* Left Side */}
        <Box
          bgcolor={alt}
          padding="93px 22px 10px"
          borderRadius="0 0 54px 0"
          position={isNonMobileScreens ? "sticky" : undefined}
          top={isNonMobileScreens ? "0" : undefined}
          height={isNonMobileScreens ? "100vh" : undefined}
          alignSelf={isNonMobileScreens ? "self-start" : undefined}
        >
          <Box
            sx={{ display: "flex", alignItems: "center", gap: "6px" }}
            width="270px"
            flexWrap="wrap"
          >
            <Typography sx={{ fontSize: "30px", fontWeight: "500" }}>
              Search result:
            </Typography>
            <Typography
              color="#00D5FA"
              fontSize="30px"
              textTransform="capitalize"
              fontWeight="600"
              sx={{ wordBreak: "break-word" }}
            >
              {searchValue}
            </Typography>
          </Box>

          <Box>
            <Typography
              m="3px 0 20px"
              fontSize="16px"
              color={medium}
              textTransform="capitalize"
              sx={{ userSelect: "none" }}
            >
              {loading
                ? "Loading..."
                : `${data?.count !== undefined ? data?.count : ""} ${`${type}${
                    data?.count > 1 ? "s" : ""
                  }`}`}
            </Typography>

            <Box display="flex" gap="10px">
              <Box borderRadius=".75rem">
                <Box
                  display="flex"
                  alignItems="center"
                  gap="4px"
                  mb="10px"
                  p="10px"
                  sx={{
                    userSelect: "none",
                    cursor: "pointer",
                    transition: ".3s",
                    fontSize: "15px",
                    fontWeight: "400",
                    textTransform: "uppercase",
                    width: "200px",
                    borderRadius: ".75rem",
                    ":hover": {
                      backgroundColor: "#8080802e",
                    },
                  }}
                  onClick={() => setType("user")}
                >
                  <People
                    sx={{ color: type === "user" ? "#00D5FA" : medium }}
                  />
                  Users
                </Box>

                <Box
                  display="flex"
                  alignItems="center"
                  gap="4px"
                  mb="10px"
                  mt="10px"
                  p="10px"
                  sx={{
                    userSelect: "none",
                    cursor: "pointer",
                    transition: ".3s",
                    fontSize: "15px",
                    fontWeight: "400",
                    textTransform: "uppercase",
                    width: "200px",
                    borderRadius: ".75rem",
                    ":hover": {
                      backgroundColor: "#8080802e",
                    },
                  }}
                  onClick={() => setType("post")}
                >
                  <CommentSharp
                    sx={{ color: type === "post" ? "#00D5FA" : medium }}
                  />
                  Posts
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Right Side */}
        <Box flex="1" pb="15px">
          <Box
            padding={isNonMobileScreens ? "93px 22px 20px" : "10px 0"}
            flex="1"
            display="flex"
            flexWrap="wrap"
            gap="10px"
            overflow="auto"
            justifyContent="center"
            alignContent="baseline"
          >
            {type === "user" && data?.data?.length > 0
              ? data?.data?.map((user) => {
                  return (
                    <Link
                      key={user._id}
                      to={`/profile/${user._id}`}
                      style={{
                        backgroundColor: alt,
                        padding: "20px",
                        borderRadius: ".75rem",
                        display: "flex",
                        justifyContent: "center",
                        flexDirection: "column",
                        textAlign: "center",
                        width: "220px",
                        maxWidth: "220px",
                        height: "fit-content",
                      }}
                      className="opacityBox"
                    >
                      <Box>
                        <UserImage
                          image={user.picturePath}
                          size="70px"
                          isSearch={true}
                        />

                        <Box mt="7px">
                          <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            gap="2px"
                          >
                            <Typography
                              fontSize="17px"
                              width="90px"
                              whiteSpace="nowrap"
                              overflow="hidden"
                              textOverflow="ellipsis"
                            >
                              {user.firstName} {user.lastName}
                            </Typography>

                            {user.verified && (
                              <VerifiedOutlined sx={{ color: "#15a1ed" }} />
                            )}
                          </Box>

                          <Typography
                            fontSize="13px"
                            color={medium}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            {user.occupation}
                          </Typography>
                        </Box>
                      </Box>
                    </Link>
                  );
                })
              : undefined}

            {type === "post" && (
              <Box width={isNonMobileScreens ? "60%" : "90%"}>
                <PostWidget
                  postLoading={loading}
                  setPostClickData={setPostClickData}
                  isPostClicked={isPostClicked}
                  setIsPostClicked={setIsPostClicked}
                  setPostClickType={setPostClickType}
                />
              </Box>
            )}

            {loading && type === "user" && <SearchSkeleton />}
          </Box>

          {data?.data?.length < data?.count && (
            <Button
              sx={{
                whiteSpace: "nowrap",
                padding: "5px 23px",
                border: "2px solid",
                fontWeight: "500",
                fontSize: "14px",
                borderRadius: "20px",
                width: "200px",
                display: "block",
                margin: "auto",
              }}
              onClick={() => setPage((prev) => prev + 1)}
            >
              More
            </Button>
          )}

          {!loading && data?.data?.length === 0 && (
            <Typography
              textAlign="center"
              fontSize="26px"
              color={theme.palette.neutral.medium}
            >
              There is no result.
            </Typography>
          )}
        </Box>
      </Box>

      {/* ------------------------------- */}

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
          postClickType={postClicType}
        />
      )}
    </Box>
  );
};

export default SearchThings;
