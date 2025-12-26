/* eslint-disable react/prop-types */
import {
  DeleteOutlined,
  EditOutlined,
  PrivacyTip,
  PushPin,
} from "@mui/icons-material";
import { IconButton, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { posts, setPosts } from "../../App";

const UserDot = (props) => {
  const token = useSelector((state) => state.token);

  const location = useLocation();

  const handlePin = async () => {
    try {
      const response = await fetch(`/api/posts/${props.postInfo.postId}/pin`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setPosts([data, ...posts.filter((ele) => ele._id !== data._id)]);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error("Error:", error);
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      gap="10px"
      width="100%"
    >
      <IconButton
        sx={{
          borderRadius: "8px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          width: "100%",
        }}
        onClick={() => {
          props.setIsDots(false);
          props.setIsEdit(true);
        }}
      >
        <EditOutlined sx={{ fontSize: "25px" }} />
        <Typography fontSize="16px">Edit The Post</Typography>
      </IconButton>

      <IconButton
        sx={{
          borderRadius: "8px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          width: "100%",
        }}
        onClick={() => {
          props.setIsDots(false), props.setIsChangePrivacy(true);
        }}
      >
        <PrivacyTip sx={{ fontSize: "25px" }} />
        <Typography fontSize="16px">Change The Privacy</Typography>
      </IconButton>

      {location.pathname.split("/")[1] === "profile" && (
        <IconButton
          sx={{
            borderRadius: "8px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
            width: "100%",
          }}
          onClick={() => {
            handlePin();
            props.setIsDots(false);
          }}
        >
          <PushPin sx={{ fontSize: "25px" }} />
          <Typography fontSize="16px">Pin The Post</Typography>
        </IconButton>
      )}

      <IconButton
        sx={{
          borderRadius: "8px",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          width: "100%",
        }}
        onClick={() => {
          // eslint-disable-next-line react/prop-types
          props.setPostWhoDeleted(props.postInfo.postId);
          props.setIsDelete(true);
          props.setIsDots(false);
        }}
      >
        <DeleteOutlined sx={{ fontSize: "25px" }} />
        <Typography fontSize="16px">Delete The Post</Typography>
      </IconButton>
    </Box>
  );
};

export default UserDot;
