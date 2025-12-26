/* eslint-disable react/prop-types */
import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";

const BadgesSkeleton = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      flexWrap="wrap"
      gap="30px"
      justifyContent="center"
    >
      <Skeleton width="100px" height="160px" sx={{ borderRadius: "50%" }} />

      <Skeleton width="100px" height="160px" sx={{ borderRadius: "50%" }} />

      <Skeleton width="100px" height="160px" sx={{ borderRadius: "50%" }} />

      <Skeleton width="100px" height="160px" sx={{ borderRadius: "50%" }} />

      <Skeleton width="100px" height="160px" sx={{ borderRadius: "50%" }} />

      <Skeleton width="100px" height="160px" sx={{ borderRadius: "50%" }} />
    </Box>
  );
};

export default BadgesSkeleton;
