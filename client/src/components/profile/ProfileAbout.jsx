/* eslint-disable react/prop-types */
import { Divider, Typography } from "@mui/material";
import { Facebook, Instagram, LinkedIn, X, YouTube } from "@mui/icons-material";
import WidgetWrapper from "../WidgetWrapper";
import { Box, useMediaQuery } from "@mui/system";
import ProfileFriendsSkeleton from "../../scenes/skeleton/ProfileFriendsSkeleton";
import { Link } from "react-router-dom";

const ProfileAbout = ({ userInfo }) => {
  const isNonMobileScreens = useMediaQuery("(min-width: 750px)");

  const calculateAge = (dateString) => {
    const birthDate = new Date(dateString);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const hasBirthdayPassedThisYear =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    if (!hasBirthdayPassedThisYear) {
      age--;
    }

    return age || 0;
  };

  return (
    <WidgetWrapper>
      <Typography
        sx={{ userSelect: "none" }}
        fontSize="24px"
        textTransform="uppercase"
        fontWeight="bold"
      >
        About
      </Typography>

      {userInfo && (
        <Box>
          <Box
            mt="15px"
            display={isNonMobileScreens && "grid"}
            gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          >
            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 2" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                name :
              </Typography>

              <Typography fontSize="17px" fontWeight="500">
                {userInfo?.firstName} {userInfo?.lastName}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 2" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                username :
              </Typography>

              <Typography fontSize="17px" fontWeight="500">
                {userInfo?.username}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 2" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                birthdate :
              </Typography>

              <Typography fontSize="17px" fontWeight="500">
                {userInfo?.birthdate?.split("-").join("/")}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 2" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                age :
              </Typography>

              <Typography fontSize="17px" fontWeight="500">
                {calculateAge(userInfo?.birthdate)}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 2" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                gender :
              </Typography>

              <Typography
                fontSize="17px"
                fontWeight="500"
                textTransform="capitalize"
              >
                {userInfo?.gender}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 2" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                location :
              </Typography>

              <Typography fontSize="17px" fontWeight="500">
                {userInfo?.location}
              </Typography>
            </Box>

            <Box
              display="flex"
              gap="8px"
              alignItems="center"
              mb="17px"
              sx={{ gridColumn: "span 4" }}
            >
              <Typography
                fontSize="15px"
                sx={{ userSelect: "none" }}
                color="text.secondary"
              >
                occupation :
              </Typography>

              <Typography fontSize="17px" fontWeight="500">
                {userInfo?.occupation}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {(userInfo?.links?.facebook ||
            userInfo?.links?.instagram ||
            userInfo?.links?.linkedin ||
            userInfo?.links?.x ||
            userInfo?.links?.youtube) && (
            <Box>
              <Typography
                sx={{ userSelect: "none" }}
                fontSize="24px"
                textTransform="uppercase"
                fontWeight="bold"
                mt="15px"
              >
                Links
              </Typography>

              {userInfo?.links?.facebook && (
                <Box display="flex" alignItems="center" mt="15px">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    color="text.secondary"
                  >
                    <Facebook />

                    <Typography fontSize="15px" sx={{ userSelect: "none" }}>
                      facebook :
                    </Typography>
                  </Box>

                  <Link
                    fontSize="17px"
                    fontWeight="500"
                    to={userInfo?.links?.facebook}
                    target="_blank"
                    style={{
                      color: "#2f9cd0",
                      fontWeight: "500",
                      textDecoration: "underline",
                      marginLeft: "5px",
                      whiteSpace: "nowrap",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userInfo?.links?.facebook}
                  </Link>
                </Box>
              )}

              {userInfo?.links?.instagram && (
                <Box display="flex" alignItems="center" mt="15px">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    color="text.secondary"
                  >
                    <Instagram />

                    <Typography fontSize="15px" sx={{ userSelect: "none" }}>
                      instagram :
                    </Typography>
                  </Box>

                  <Link
                    fontSize="17px"
                    fontWeight="500"
                    to={userInfo?.links?.instagram}
                    target="_blank"
                    style={{
                      color: "#2f9cd0",
                      fontWeight: "500",
                      textDecoration: "underline",
                      marginLeft: "5px",
                      whiteSpace: "nowrap",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userInfo?.links?.instagram}
                  </Link>
                </Box>
              )}

              {userInfo?.links?.linkedin && (
                <Box display="flex" alignItems="center" mt="15px">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    color="text.secondary"
                  >
                    <LinkedIn />

                    <Typography fontSize="15px" sx={{ userSelect: "none" }}>
                      linkedin :
                    </Typography>
                  </Box>

                  <Link
                    fontSize="17px"
                    fontWeight="500"
                    to={`${userInfo?.links?.linkedin}`}
                    target="_blank"
                    style={{
                      color: "#2f9cd0",
                      fontWeight: "500",
                      textDecoration: "underline",
                      marginLeft: "5px",
                      whiteSpace: "nowrap",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userInfo?.links?.linkedin}
                  </Link>
                </Box>
              )}

              {userInfo?.links?.x && (
                <Box display="flex" alignItems="center" mt="15px">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    color="text.secondary"
                  >
                    <X />:
                  </Box>

                  <Link
                    fontSize="17px"
                    fontWeight="500"
                    to={userInfo?.links?.x}
                    target="_blank"
                    style={{
                      color: "#2f9cd0",
                      fontWeight: "500",
                      textDecoration: "underline",
                      marginLeft: "5px",
                      whiteSpace: "nowrap",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userInfo?.links?.x}
                  </Link>
                </Box>
              )}

              {userInfo?.links?.youtube && (
                <Box display="flex" alignItems="center" mt="15px">
                  <Box
                    display="flex"
                    alignItems="center"
                    gap="4px"
                    color="text.secondary"
                  >
                    <YouTube />:
                  </Box>

                  <Link
                    fontSize="17px"
                    fontWeight="500"
                    to={userInfo?.links?.youtube}
                    target="_blank"
                    style={{
                      color: "#2f9cd0",
                      fontWeight: "500",
                      textDecoration: "underline",
                      marginLeft: "5px",
                      whiteSpace: "nowrap",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {userInfo?.links?.youtube}
                  </Link>
                </Box>
              )}
            </Box>
          )}
        </Box>
      )}

      {!userInfo && <ProfileFriendsSkeleton />}
    </WidgetWrapper>
  );
};

export default ProfileAbout;
