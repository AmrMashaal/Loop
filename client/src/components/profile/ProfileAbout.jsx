/* eslint-disable react/prop-types */
import { Divider, Typography } from "@mui/material";
import { Facebook, Instagram, LinkedIn, X, YouTube } from "@mui/icons-material";
import WidgetWrapper from "../WidgetWrapper";
import { Box, useMediaQuery } from "@mui/system";
import ProfileFriendsSkeleton from "../../scenes/skeleton/ProfileFriendsSkeleton";
import { Link } from "react-router-dom";
import { countriesWithFlags } from "../../../infoArrays";

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

              <Typography fontSize="17px">
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

              <Typography fontSize="17px">{userInfo?.username}</Typography>
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

              <Typography fontSize="17px">
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

              <Typography fontSize="17px">
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

              <Typography fontSize="17px" textTransform="capitalize">
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

              <Typography fontSize="17px">
                {userInfo?.location}{" "}
                {countriesWithFlags.find((country) => {
                  return country.country === userInfo?.location;
                }).flag}
              </Typography>
            </Box>

            {userInfo?.occupation && (
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

                <Typography fontSize="17px">{userInfo?.occupation}</Typography>
              </Box>
            )}
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
                <Link
                  to={userInfo?.links?.facebook}
                  style={{
                    userSelect: "none",
                    fontWeight: "bold",
                  }}
                  target="_blank"
                >
                  <Box display="flex" alignItems="center" mt="15px">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      color="text.secondary"
                      sx={{
                        transition: ".3s",
                        ":hover": { color: "black" },
                      }}
                    >
                      <Facebook />
                      Facebook
                    </Box>
                  </Box>
                </Link>
              )}

              {userInfo?.links?.instagram && (
                <Link
                  to={userInfo?.links?.instagram}
                  style={{
                    userSelect: "none",
                    fontWeight: "bold",
                  }}
                  target="_blank"
                >
                  <Box display="flex" alignItems="center" mt="15px">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      color="text.secondary"
                      sx={{
                        transition: ".3s",
                        ":hover": { color: "black" },
                      }}
                    >
                      <Instagram />
                      Instagram
                    </Box>
                  </Box>
                </Link>
              )}

              {userInfo?.links?.linkedin && (
                <Link
                  to={userInfo?.links?.linkedin}
                  style={{
                    userSelect: "none",
                    fontWeight: "bold",
                  }}
                  target="_blank"
                >
                  <Box display="flex" alignItems="center" mt="15px">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      color="text.secondary"
                      sx={{
                        transition: ".3s",
                        ":hover": { color: "black" },
                      }}
                    >
                      <LinkedIn />
                      Linkedin
                    </Box>
                  </Box>
                </Link>
              )}

              {userInfo?.links?.x && (
                <Link
                  to={userInfo?.links?.x}
                  style={{
                    userSelect: "none",
                    fontWeight: "bold",
                  }}
                  target="_blank"
                >
                  <Box display="flex" alignItems="center" mt="15px">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      color="text.secondary"
                      sx={{
                        transition: ".3s",
                        ":hover": { color: "black" },
                      }}
                    >
                      <X />X
                    </Box>
                  </Box>
                </Link>
              )}

              {userInfo?.links?.youtube && (
                <Link
                  to={userInfo?.links?.youtube}
                  style={{
                    userSelect: "none",
                    fontWeight: "bold",
                  }}
                  target="_blank"
                >
                  <Box display="flex" alignItems="center" mt="15px">
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      color="text.secondary"
                      sx={{
                        transition: ".3s",
                        ":hover": { color: "black" },
                      }}
                    >
                      <YouTube />
                      YouTube
                    </Box>
                  </Box>
                </Link>
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
