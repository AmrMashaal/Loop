/* eslint-disable react/prop-types */
import { IconButton, Typography } from "@mui/material";
import FlexBetween from "./../FlexBetween";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";

const LikePost = ({
  ele,
  setShowLikes,
  handleLike,
  whoLikes,
  setIsPostClicked,
  setPostClickData,
  loading,
}) => {
  function formatLikesCount(number) {
    if (number < 1000) {
      return number.toString();
    } else if (number < 1000000) {
      return (number / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    } else if (number < 1000000000) {
      return (number / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    } else {
      return (number / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }
  }

  return (
    <FlexBetween>
      <FlexBetween gap="8px">
        <FlexBetween>
          <IconButton
            onClick={() => handleLike(ele || [])}
            disabled={loading.postId === ele._id}
          >
            {ele?.isLiked ? (
              <FavoriteOutlined sx={{ color: "red" }} />
            ) : (
              <FavoriteBorderOutlined />
            )}
          </IconButton>

          <Typography
            sx={{ cursor: "pointer" }}
            onClick={() => {
              setShowLikes(true);
              whoLikes(ele?._id);
            }}
          >
            {formatLikesCount(ele?.likesCount)}
          </Typography>
        </FlexBetween>

        <FlexBetween
          sx={{ cursor: "pointer" }}
          onClick={() => {
            setIsPostClicked(true),
              setPostClickData({
                picturePath: ele?.picturePath,
                firstName: ele?.firstName,
                lastName: ele?.lastName,
                userPicturePath: ele?.userPicturePath,
                description: ele?.description,
                _id: ele?._id,
                userId: ele?.userId,
                verified: ele?.verified,
              });
          }}
        >
          <IconButton>
            <ChatBubbleOutlineOutlined />
          </IconButton>

          {formatLikesCount(ele?.commentCount)}
        </FlexBetween>
      </FlexBetween>

      <IconButton>
        <ShareOutlined />
      </IconButton>
    </FlexBetween>
  );
};

export default LikePost;
