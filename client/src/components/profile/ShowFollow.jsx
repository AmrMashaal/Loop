/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import TasksComponent from "../TasksComponent";
import FlexBetween from "../FlexBetween";
import { Box } from "@mui/system";
import UserImage from "../UserImage";
import { Divider, Typography } from "@mui/material";
import { VerifiedOutlined } from "@mui/icons-material";
import { useEffect, useRef } from "react";

const ShowFollow = ({
  openFollow,
  setOpenFollow,
  setPage,
  follows,
  handleGetFollowers,
  handleGetFollowing,
  page,
  followType,
  getFollowLoading,
  palette,
  setFollows,
}) => {
  const parentRef = useRef(null);

  useEffect(() => {
    const div = parentRef.current;

    const handleScroll = () => {
      if (div.scrollTop + div.clientHeight >= div.scrollHeight - 10) {
        setPage((prev) => prev + 1);
      }
    };

    div.addEventListener("scroll", handleScroll);

    return () => {
      div.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (followType === "followers" && openFollow) {
      handleGetFollowers();
    } else if (followType === "following" && openFollow) {
      handleGetFollowing();
    }
  }, [page]);

  return (
    <TasksComponent
      description={followType}
      open={openFollow}
      setOpen={setOpenFollow}
      setPage={setPage}
    >
      <Box
        display="flex"
        flexDirection="column"
        gap="10px"
        height="100%"
        overflow="auto"
        ref={parentRef}
      >
        {getFollowLoading && (
          <Box
            className="loadingAnimation"
            width="20px"
            height="20px"
            ml="8px"
          />
        )}

        {follows?.length > 0 &&  !getFollowLoading && 
          follows?.map((fol, index) => {
            const user =
              followType === "followers" ? fol?.follower : fol?.following;

            return (
              <>
                <Link
                  to={`/profile/${user?._id}`}
                  className="opacityBox"
                  onClick={() => {
                    setOpenFollow(false);
                    setFollows([]);
                    setPage(1);

                  }}
                >
                  <FlexBetween key={index} sx={{ cursor: "pointer" }}>
                    <Box display="flex" alignItems="center" gap="10px">
                      <UserImage image={user?.picturePath} />
                      <Box display="flex" alignItems="center" gap="4px">
                        <Typography>
                          {user?.firstName} {user?.lastName}
                        </Typography>

                        {user?.verified && (
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
                {follows?.indexOf(fol) !== follows?.length - 1 && <Divider />}
              </>
            );
          })}

        {!getFollowLoading && follows?.length === 0  && (
          <Typography
            textAlign="center"
            fontSize="26px"
            color={palette.neutral.medium}
            mb="20px"
          >
            User has no {followType} yet
          </Typography>
        )}
      </Box>
    </TasksComponent>
  );
};

export default ShowFollow;
