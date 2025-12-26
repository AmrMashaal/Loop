/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import TasksComponent from "../TasksComponent";
import FlexBetween from "../FlexBetween";
import { Box } from "@mui/system";
import UserImage from "../UserImage";
import { Divider, Typography } from "@mui/material";
import { VerifiedOutlined } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { debounce } from "lodash";

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
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const handleFetching = async () => {
      if (!hasMore) return;

      let data;

      if (followType === "followers") {
        data = await handleGetFollowers();
      } else if (followType === "following") {
        data = await handleGetFollowing();
      }

      if (data?.length === 0) {
        setHasMore(false);
      }
    };

    const debounceFetch = debounce(() => {
      handleFetching();
    }, 300)

    debounceFetch();
  }, [page, hasMore]);

  const Row = ({ index, style }) => {
    const fol = follows[index];

    const user = followType === "followers" ? fol?.follower : fol?.following;

    if (!user.username) return null;

    return (
      <Box
        key={index}
        display="flex"
        flexDirection="column"
        gap="15px"
        style={style}
      >
        <Link
          to={`/profile/${user?._id}`}
          className="opacityBox"
          onClick={() => {
            setOpenFollow(false);
            setFollows([]);
            setPage(1);
          }}
        >
          <FlexBetween sx={{ cursor: "pointer" }}>
            <Box display="flex" alignItems="center" gap="10px">
              <UserImage image={user?.picturePath} />
              <Box>
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

                <Typography
                  fontSize="12px"
                  color={palette.neutral.main}
                  sx={{ userSelect: "none" }}
                >
                  @{user?.username}
                </Typography>
              </Box>
            </Box>
          </FlexBetween>
        </Link>
        {follows?.indexOf(fol) !== follows?.length - 1 && <Divider />}
      </Box>
    );
  };

  const handleItemsRendered = ({ visibleStopIndex }) => {
    if (
      visibleStopIndex >= follows?.length - 1 &&
      hasMore &&
      !getFollowLoading
    ) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  return (
    <TasksComponent
      description={followType}
      open={openFollow}
      setOpen={setOpenFollow}
      setPage={setPage}
      overflowAuto={false}
    >
      <Box display="flex" flexDirection="column" gap="10px">
        {getFollowLoading ? (
          <Box
            className="loadingAnimation"
            width="20px"
            height="20px"
            ml="8px"
          />
        ) : !getFollowLoading && follows?.length > 0 ? (
          <List
            height={530}
            itemCount={follows?.length}
            itemSize={90}
            width="100%"
            onItemsRendered={handleItemsRendered}
          >
            {Row}
          </List>
        ) : (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
            width="100%"
          >
            <Typography color={palette.neutral.main}>
              No {followType} yet
            </Typography>
          </Box>
        )}
      </Box>
    </TasksComponent>
  );
};

export default ShowFollow;
