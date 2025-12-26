import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";

const ChatHistorySkeleton = () => {
  return (
    <Box>
      <Box display="flex" gap="7px" alignItems="center" m="10px 0 -20px">
        <Skeleton sx={{ width: "55px", height: "90px", borderRadius: "50%" }} />
        <Box>
          <Skeleton width="100px" height="25px" />
          <Skeleton width="140px" height="20px" />
        </Box>
      </Box>

      <Box display="flex" gap="7px" alignItems="center" m="0px 0 -20px">
        <Skeleton sx={{ width: "55px", height: "90px", borderRadius: "50%" }} />
        <Box>
          <Skeleton width="120px" height="25px" />
          <Skeleton width="140px" height="20px" />
        </Box>
      </Box>

      <Box display="flex" gap="7px" alignItems="center" m="0px 0 -20px">
        <Skeleton sx={{ width: "55px", height: "90px", borderRadius: "50%" }} />
        <Box>
          <Skeleton width="100px" height="25px" />
          <Skeleton width="140px" height="20px" />
        </Box>
      </Box>

      <Box display="flex" gap="7px" alignItems="center" m="0px 0 -20px">
        <Skeleton sx={{ width: "55px", height: "90px", borderRadius: "50%" }} />
        <Box>
          <Skeleton width="120px" height="25px" />
          <Skeleton width="140px" height="20px" />
        </Box>
      </Box>

      <Box display="flex" gap="7px" alignItems="center">
        <Skeleton sx={{ width: "55px", height: "90px", borderRadius: "50%" }} />
        <Box>
          <Skeleton width="100px" height="25px" />
          <Skeleton width="140px" height="20px" />
        </Box>
      </Box>
    </Box>
  );
};

export default ChatHistorySkeleton;
