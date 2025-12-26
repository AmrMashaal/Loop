import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";

// eslint-disable-next-line react/prop-types
const ChatSkeleton = ({ isNonMobileScreens }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      mt="45px"
      p={isNonMobileScreens ? "0 50px" : "0 15px"}
    >
      <Box display="flex" gap="10px" width="100%">
        <Skeleton width="50px" sx={{ borderRadius: "50%" }} />
        <Skeleton width="30%" height="80px" />
      </Box>

      <Box display="flex" gap="10px" width="100%">
        <Skeleton width="50px" sx={{ borderRadius: "50%" }} />
        <Skeleton width="40%" height="80px" />
      </Box>

      <Box
        display="flex"
        gap="10px"
        alignSelf="end"
        flexDirection="row-reverse"
        width="100%"
      >
        <Skeleton width="50px" sx={{ borderRadius: "50%" }} />
        <Skeleton width="40%" height="80px" />
      </Box>

      <Box display="flex" gap="10px" width="100%">
        <Skeleton width="50px" sx={{ borderRadius: "50%" }} />
        <Skeleton width="40%" height="80px" />
      </Box>

      <Box
        display="flex"
        gap="10px"
        alignSelf="end"
        flexDirection="row-reverse"
        width="100%"
        alignItems="center"
      >
        <Skeleton width="50px" height="80px" sx={{ borderRadius: "50%" }} />
        <Skeleton width="50%" height="125px" />
      </Box>

      <Box display="flex" gap="10px" width="100%">
        <Skeleton width="50px" sx={{ borderRadius: "50%" }} />
        <Skeleton width="50%" height="80px" />
      </Box>
    </Box>
  );
};

export default ChatSkeleton;
