/* eslint-disable react/prop-types */
import { Button, IconButton, Typography } from "@mui/material";
import FlexBetween from "./../FlexBetween";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  Reply,
} from "@mui/icons-material";
import { formatLikesCount } from "../../frequentFunctions";

const LikePost = ({
  ele,
  setShowLikes,
  handleLike,
  setPostInfo,
  setIsPostClicked,
  setPostClickData,
  loading,
  palette,
  setIsShare,
  setPostClickType,
}) => {
   return (
    <FlexBetween
      sx={{ userSelect: "none" }}
      color={palette.text.secondary}
      mt="10px"
      p="0px 10px 6px"
    >
      <FlexBetween gap="8px">
        <FlexBetween position="relative">
          <IconButton
            onClick={() => handleLike(ele || [])}
            disabled={loading.postId === ele._id}
          >
            {ele?.isLiked ? (
              <FavoriteOutlined sx={{ color: palette.primary.main }} />
            ) : (
              <FavoriteBorderOutlined sx={{ color: palette.text.secondary }} />
            )}
          </IconButton>

          <Typography
            sx={{ cursor: "pointer" }}
            onClick={() => {
              setShowLikes(true);

              setPostInfo(
                typeof ele.postId === "object"
                  ? { postId: ele, userId: null }
                  : { postId: ele._id, userId: null }
              );
            }}
          >
            {formatLikesCount(ele?.likesCount)}
          </Typography>
        </FlexBetween>
        <FlexBetween
          sx={{ cursor: "pointer" }}
          onClick={() => {
            setIsPostClicked(true),
              setPostClickType(
                typeof ele?.postId === "object" ? "repost" : "post"
              );

            setPostClickData({
              firstName: ele?.userId?.firstName,
              lastName: ele?.userId?.lastName,
              picturePath: ele?.picturePath|| ele?.postId?.picturePath,
              userPicturePath: ele?.userId?.picturePath,
              description: ele.description,
              _id: ele?._id,
              userId: ele?.userId?._id,
              verified: ele?.userId?.verified,
            });
          }}
        >
          <IconButton>
            <ChatBubbleOutlineOutlined
              sx={{
                color: palette.text.secondary,
              }}
            />
          </IconButton>

          {formatLikesCount(ele?.commentCount)}
        </FlexBetween>
        {ele?.privacy !== "private" && ele?.postId !== null && (
          <Button
            sx={{
              color: palette.text.secondary,
              ":hover": {
                backgroundColor: "rgb(107 107 107 / 11%)",
              },
              display: "flex",
              gap: "8px",
            }}
            onClick={() => {
              setIsShare(true);
              setPostInfo(
                typeof ele.postId === "object"
                  ? {
                      postId: ele?.postId?._id,
                      userId: ele?.postId?.userId?._id,
                    }
                  : { postId: ele?._id, userId: ele?.userId?._id }
              );
            }}
          >
            <Reply
              sx={{
                transform: "rotateY(180deg)",
                color: palette.text.secondary,
              }}
            />
            Share
          </Button>
        )}
      </FlexBetween>

      {ele?.shareCount > 0 && (
        <Typography sx={{ fontSize: "12px", color: palette.text.secondary }}>
          {ele?.shareCount} {ele?.shareCount > 1 ? "shares" : "share"}
        </Typography>
      )}
    </FlexBetween>
  );
};

export default LikePost;
