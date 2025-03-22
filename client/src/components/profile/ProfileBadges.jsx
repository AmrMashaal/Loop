/* eslint-disable react/prop-types */
import { Typography } from "@mui/material";
import { Box, useMediaQuery, useTheme } from "@mui/system";
import { useEffect, useState } from "react";
import BadgesSkeleton from "../../scenes/skeleton/BadgesSkeleton";
import { Star } from "@mui/icons-material";

const ProfileBadges = ({ token, userId }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  const { palette } = useTheme();

  const isNonMobileScreens = useMediaQuery("(min-width: 1060px)");

  const ProfileBadges = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/badges/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      setBadges(data);
    } catch (error) {
      if (import.meta.env.VITE_NODE_ENV === "development") {
        console.error(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ProfileBadges();
  }, [userId]);

  return (
    <Box
      display="flex"
      justifyContent={isNonMobileScreens ? "flex-start" : "center"}
      flexWrap="wrap"
      gap="50px"
      my="20px"
      mx="25px"
    >
      {loading && (
        <Typography
          textAlign="center"
          fontSize="30px"
          color={palette.neutral.medium}
          my="20px"
        >
          <BadgesSkeleton />
        </Typography>
      )}

      {!loading && badges.length === 0 && (
        <Typography
          textAlign="center"
          fontSize="30px"
          color={palette.neutral.medium}
          my="20px"
        >
          User has no badges
        </Typography>
      )}

      {!loading &&
        badges.length > 0 &&
        badges?.map((bd, index) => (
          <Box
            key={index}
            display="flex"
            alignItems="center"
            justifyContent="center"
            flexDirection="column"
            gap="10px"
            sx={{ userSelect: "none" }}
          >
            {bd?.level !== "platinum" && (
              <Typography
                fontSize="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="50%"
                p="20px"
                width="100px"
                height="100px"
                sx={{
                  background:
                    bd.level === "bronze"
                      ? "linear-gradient(45deg, #CD7F32, #D2B48C)"
                      : bd.level === "silver"
                      ? "linear-gradient(45deg, #C0C0C0, #D3D3D3)"
                      : bd.level === "gold"
                      ? "linear-gradient(45deg, #FFD700, #FFEC8B)"
                      : bd.level === "diamond"
                      ? "linear-gradient(45deg, #B9F2FF, #E0FFFF)"
                      : "none",
                  boxShadow:
                    bd.level !== "platinum"
                      ? "-1px 3px 0px 0 rgba(0, 0, 0, 0.1), inset 0px 4px 10px rgba(0, 0, 0, 0.2)"
                      : "none",
                }}
                border={`1px solid ${
                  bd.level === "bronze"
                    ? "#8C7853"
                    : bd.level === "silver"
                    ? "#C0C0C0"
                    : bd.level === "gold"
                    ? "#FFD700"
                    : bd.level === "diamond"
                    ? "#B9F2FF"
                    : "none"
                }`}
              >
                {bd?.icon}
              </Typography>
            )}

            {bd?.level === "platinum" && bd?.type !== "firstUsers" && (
              <Star
                sx={{
                  fontSize: "100px",
                  background: "linear-gradient(to right, orange, yellow)",
                  borderRadius: "50%",
                  p: "4px",
                  ml: "10px",
                  boxShadow:
                    "-1px 3px 0px 0 rgba(0, 0, 0, 0.1), inset 0px 4px 10px rgba(0, 0, 0, 0.2)",
                  color: "black",
                }}
              />
            )}

            {bd?.type === "firstUsers" && (
              <Typography
                fontSize="40px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderRadius="50%"
                p="20px"
                width="100px"
                height="100px"
                sx={{
                  background: "linear-gradient(-55deg, #d67212, #ffec8b)",
                  boxShadow:
                    "-1px 3px 0px 0 rgba(0, 0, 0, 0.1), inset 0px 4px 10px rgba(0, 0, 0, 0.2)",
                  border: "1px solid #ecb155",
                }}
              >
                <img src="/assets/3_22_2025 5_32_59 AM.png" width="56" alt="" />
              </Typography>
            )}

            <Typography
              fontSize="15px"
              textTransform="uppercase"
              fontWeight="bold"
            >
              {bd?.name}
            </Typography>

            <Typography
              fontSize="12px"
              mt="-10px"
              color={palette.neutral.medium}
            >
              {bd?.description}
            </Typography>
          </Box>
        ))}
    </Box>
  );
};

export default ProfileBadges;
