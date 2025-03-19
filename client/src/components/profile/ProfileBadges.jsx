import { Typography } from "@mui/material";
import { Box, useTheme } from "@mui/system";

const ProfileBadges = () => {
  const { palette } = useTheme();

  return (
    <Box>
      <Typography
        textAlign="center"
        fontSize="50px"
        color={palette.neutral.medium}
        my="20px"
      >
        SOON!
      </Typography>
    </Box>
  );
};

export default ProfileBadges;
