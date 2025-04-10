/* eslint-disable react/prop-types */
import { Box  } from "@mui/system";
import FlexBetween from "./../components/FlexBetween";
import UserImage from "./../components/UserImage";
import { Button, Divider, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { VerifiedOutlined } from "@mui/icons-material";
import TasksComponent from "./../components/TasksComponent";
import { useEffect } from "react";

const WhoLiked = ({
  likesLoading,
  likeList,
  showLikes,
  setShowLikes,
  page,
  setPage,
  WhoLikes,
  elementId,
}) => {
  useEffect(() => {
    if (page === 1) {
      WhoLikes(elementId, true);
    } else {
      WhoLikes(elementId);
    }
  }, [page, showLikes]);

  return (
    <TasksComponent
      setOpen={setShowLikes}
      description="Likes Info"
      open={showLikes}
      setPage={setPage}
    >
      {!likesLoading && likeList?.likes?.length < 1 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width="100%"
          height="100%"
          position="absolute"
          top="50%"
          left="50%"
          sx={{
            transform: "translate(-50%,-50%)",
          }}
        >
          <Typography fontSize="25px">There are no likes yet</Typography>
        </Box>
      )}
      {likeList?.likes?.map((user, index) => {
        return (
          <>
            <Link to={`/profile/${user?.userId?._id}`} className="opacityBox">
              <FlexBetween key={index} sx={{ cursor: "pointer" }}>
                <Box display="flex" alignItems="center" gap="10px">
                  <UserImage image={user?.userId?.picturePath} />
                  <Box display="flex" alignItems="center" gap="4px">
                    <Typography>
                      {user?.userId?.firstName || "Undefined"}{" "}
                      {user?.userId?.lastName}
                    </Typography>
                    {user?.userId?.verified && (
                      <VerifiedOutlined
                        sx={{
                          fontSize: "20px",
                          color: "#15a1ed",
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </FlexBetween>
            </Link>
            {likeList?.likes?.indexOf(user) !== likeList?.likes?.length - 1 && (
              <Divider />
            )}
          </>
        );
      })}

      {likesLoading && (
        <Box
          className="loadingAnimation"
          width="20px"
          height="20px"
          ml="8px"
        ></Box>
      )}

      {likeList?.likes?.length < likeList?.count && (
        <Button sx={{ mt: "10px" }} onClick={() => setPage((prev) => prev + 1)}>
          View More Likes
        </Button>
      )}
    </TasksComponent>
  );
};

export default WhoLiked;
