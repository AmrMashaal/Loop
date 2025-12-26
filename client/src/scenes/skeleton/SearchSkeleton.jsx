import { Skeleton } from "@mui/material";
import { Box } from "@mui/system";

const SearchSkeleton = () => {
  return (
    <>
      <Box width="100%"></Box>
      <Box
        flex="1"
        display="flex"
        flexWrap="wrap"
        gap="10px"
        overflow="unsnet"
        justifyContent="center"
        alignContent="baseline"
        mt="33px"
        height="fit-content"
      >
        {Array.from({ length: 5 }, (_, index) => {
          return (
            <Skeleton
              key={index}
              sx={{
                borderRadius: ".75rem",
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                textAlign: "center",
                width: "220px",
                maxWidth: "220px",
                height: "260px",
                mt: "-100px",
              }}
            ></Skeleton>
          );
        })}
      </Box>
    </>
  );
};

export default SearchSkeleton;
