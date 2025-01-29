import { Divider, Skeleton } from "@mui/material";
import { Box } from "@mui/system";

const ProfileFriendsSkeleton = () => {
  return (
    <Box>
      <Box display="flex" gap="10px" alignItems="center" mt="-10px" pb="4px">
        <Skeleton width="50px" height="80px" sx={{ borderRadius: "50%" }} />
        <Box>
          <Skeleton width="100px" />
          <Skeleton />
        </Box>
      </Box>
      <Divider />
      <Box display="flex" gap="10px" alignItems="center" mt="-10px" py="4px">
        <Skeleton width="50px" height="80px" sx={{ borderRadius: "50%" }} />
        <Box>
          <Skeleton width="100px" />
          <Skeleton />
        </Box>
      </Box>
      <Divider />
      <Box display="flex" gap="10px" alignItems="center" mt="-10px" py="4px">
        <Skeleton width="50px" height="80px" sx={{ borderRadius: "50%" }} />
        <Box>
          <Skeleton width="100px" />
          <Skeleton />
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileFriendsSkeleton;
