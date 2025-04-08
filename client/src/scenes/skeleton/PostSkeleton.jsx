import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";

const PostSkeleton = () => {
  return (
    <Box mt="-21px">
      <Box position="relative">
        <Box
          position="absolute"
          top="19px"
          left="10px"
          display="flex"
          alignItems="center"
          gap="7px"
      >
          <Skeleton width="40px" height="63px" sx={{ borderRadius: "50%" }} />
          <Box>
            <Skeleton width="100px" height="10px" />
            <Skeleton width="50px" height="10px" />
          </Box>
        </Box>
        <Skeleton width="100%" height="100px" />
        <Skeleton
          sx={{ m: "-178px 0 0 0", borderRadius: "0" }}
          height="700px"
          width="100%"
        />
        <Box position="relative">
          <Skeleton sx={{ m: "-154px 0 0 0" }} height="100px" width="100%" />
          <Skeleton
            width="30px"
            height="23px"
            sx={{ position: "absolute", top: "40px", left: "10px" }}
          />

          <Skeleton
            width="30px"
            height="23px"
            sx={{ position: "absolute", top: "40px", left: "50px" }}
          />
        </Box>
      </Box>
      {/* ----------------------second post---------------------- */}
      <Box position="relative" mt="-30px">
        <Box
          position="absolute"
          top="19px"
          left="10px"
          display="flex"
          alignItems="center"
          gap="7px"
        >
          <Skeleton width="40px" height="63px" sx={{ borderRadius: "50%" }} />
          <Box>
            <Skeleton width="100px" height="10px" />
            <Skeleton width="50px" height="10px" />
          </Box>
        </Box>
        <Skeleton width="100%" height="100px" />
        <Skeleton
          sx={{ m: "-128px 0 0 0", borderRadius: "0" }}
          height="470px"
          width="100%"
        />

        <Box position="relative">
          <Skeleton sx={{ m: "-112px 0 0 0" }} height="100px" width="100%" />
          <Skeleton
            width="30px"
            height="23px"
            sx={{ position: "absolute", top: "40px", left: "10px" }}
          />

          <Skeleton
            width="30px"
            height="23px"
            sx={{ position: "absolute", top: "40px", left: "50px" }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default PostSkeleton;
