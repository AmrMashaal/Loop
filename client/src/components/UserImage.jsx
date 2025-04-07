/* eslint-disable react/prop-types */
import { useTheme } from "@emotion/react";
import { Box, Tooltip } from "@mui/material";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";

const UserImage = ({
  image,
  size = "60px",
  isProfile,
  isSearch,
  isOnline = false,
  isNav,
  isActive,
}) => {
  const theme = useTheme();

  const user = useSelector((state) => state.user);
  const { userId } = useParams();

  return (
    <Box
      width={size}
      height={size}
      margin={isSearch ? "auto" : undefined}
      position="relative"
    >
      <img
        style={{
          backgroundColor: "gray",
          borderRadius: "50%",
          objectFit: "cover",
          userSelect: "none",
          border: isProfile
            ? `6px solid ${theme.palette.primary.dark}`
            : isNav && !isActive
            ? `2px solid white`
            : isActive
            ? `2px solid #00D5FA`
            : undefined,
          boxShadow: isProfile
            ? "rgba(0, 0, 0, 0.13) 3px 6px 7px 0px"
            : undefined,
        }}
        width={size}
        height={size}
        src={image ? image : "/assets/loading-user.png"}
        alt="user img"
      />

      {isOnline && user?._id !== userId && (
        <Tooltip arrow placement="top" title="Online">
          <Box
            bgcolor="lightgreen"
            width={isProfile ? "20px" : "15px"}
            height={isProfile ? "20px" : "15px"}
            borderRadius="50%"
            position="absolute"
            bottom={isProfile ? "0px" : "5px"}
            right={isProfile ? "14px" : "0px"}
            border="2px solid white"
          ></Box>
        </Tooltip>
      )}
    </Box>
  );
};

export default UserImage;
