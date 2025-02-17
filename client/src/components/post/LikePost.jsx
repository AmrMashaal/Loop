/* eslint-disable react/prop-types */
import { IconButton, Typography } from "@mui/material";
import FlexBetween from "./../FlexBetween";
import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
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
}) => {
  return (
    <FlexBetween>
      <FlexBetween gap="8px">
        <FlexBetween position="relative">
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
              setPostInfo({ postId: ele._id, userId: null });
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
    </FlexBetween>
  );
};

export default LikePost;
