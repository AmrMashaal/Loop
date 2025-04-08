/* eslint-disable react/prop-types */
import { VerifiedOutlined } from "@mui/icons-material";
import { Box, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import ProfileFriendsSkeleton from "../../scenes/skeleton/ProfileFriendsSkeleton";

const UserFriends = ({
  userFriends,
  loading,
  user,
  userId,
  isNonMobileScreens,
}) => {
  const { palette } = useTheme();
  return (
    <Box
      mt="10px"
      overflow="auto"
      display="flex"
      flexWrap="wrap"
      alignContent="center"
      justifyContent={
        loading ||
        (isNonMobileScreens &&
          userFriends?.friends?.length < 6 &&
          userFriends?.friends?.length !== 3)
          ? "start"
          : isNonMobileScreens &&
            (userFriends?.friends?.length === 6 ||
              userFriends?.friends?.length === 3)
          ? "center"
          : !isNonMobileScreens && userFriends?.friends?.length > 2
          ? "center"
          : undefined
      }
      gap={isNonMobileScreens ? "10px" : "20px"}
      sx={{
        scrollbarWidth: "none",
      }}
    >
      {!loading ? (
        userFriends.friends && userFriends?.friends?.length > 0 ? (
          userFriends?.friends?.map((friend, index) => {
            // i trust in allah, i trust in myself
            return (
              <Box
                key={index}
                mb="15px"
                className="opacityBox"
                textAlign="center"
              >
                <Link
                  to={`/profile/${
                    friend?.sender?._id === userId
                      ? friend?.receiver?._id
                      : friend?.sender?._id
                  }`}
                >
                  <Box
                    display="flex"
                    gap="12px"
                    flexDirection="column"
                    width={isNonMobileScreens ? "116px" : "80px"}
                  >
                    <img
                      src={
                        friend?.sender?._id === userId
                          ? friend?.receiver?.picturePath
                          : friend?.sender?.picturePath ||
                            "/assets/loading-user.png"
                      }
                      alt={
                        friend?.sender?._id === userId
                          ? friend?.receiver?.picturePath
                          : friend?.sender?.picturePath
                      }
                      style={{
                        width: "100%",
                        height: isNonMobileScreens ? "120px" : "80px",
                        borderRadius: "7px",
                        objectFit: "cover",
                      }}
                    />
                    <Box
                      display="flex"
                      flexDirection="column"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Box display="flex" gap="3px" alignItems="center">
                        <Typography
                          fontSize="14px"
                          sx={{
                            maxWidth: isNonMobileScreens ? "100px" : "60px",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            overflow: "hidden",
                          }}
                          className="usernameFriends"
                        >
                          {friend?.sender?._id === userId
                            ? friend?.receiver?.firstName
                            : friend?.sender?.firstName}{" "}
                          {friend?.sender?._id === userId
                            ? friend?.receiver?.lastName
                            : friend?.sender?.lastName}
                        </Typography>

                        {friend?.sender?._id === userId
                          ? friend?.receiver?.verified && (
                              <VerifiedOutlined
                                sx={{ fontSize: "18px", color: "#15a1ed" }}
                              />
                            )
                          : friend?.sender?.verified && (
                              <VerifiedOutlined
                                sx={{ fontSize: "18px", color: "#15a1ed" }}
                              />
                            )}
                      </Box>

                      <Typography
                        color="#858585"
                        whiteSpace="nowrap"
                        overflow="hidden"
                        textOverflow="ellipsis"
                        fontSize="12px"
                        sx={{
                          maxWidth: isNonMobileScreens ? "100px" : "80px",
                          whiteSpace: "nowrap",
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        {friend?.sender?._id === userId
                          ? friend?.receiver?.occupation
                          : friend?.sender?.occupation}
                      </Typography>
                    </Box>
                  </Box>
                </Link>
              </Box>
            );
          })
        ) : (
          <Typography>
            {user._id === userId
              ? "You don't have friends yet"
              : "doesn't have friends yet"}
          </Typography>
        )
      ) : (
        <ProfileFriendsSkeleton />
      )}
    </Box>
  );
};

export default UserFriends;
