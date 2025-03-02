/* eslint-disable react/prop-types */
import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect, useState } from "react";
import { setIsOverFlow } from "../../App";
import TasksComponent from "../TasksComponent";
import { Lock, People, Public } from "@mui/icons-material";

const ChangePrivacy = ({
  palette,
  setIsChangePrivacy,
  isChangePrivacy,
  handleChangePrivacy,
  changePrivacyLoading,
}) => {
  const [postPrivacy, setPostPrivacy] = useState("");

  useEffect(() => {
    if (isChangePrivacy) {
      setIsOverFlow(true);
    } else {
      setIsOverFlow(false);
    }

    return () => {
      setIsOverFlow(false);
    };
  }, [isChangePrivacy]);

  const privacyArray = [
    {
      name: "public",
      icon: Public,
      description: "Anyone can see your post",
    },
    {
      name: "friends",
      icon: People,
      description: "Only friends can see your post",
    },
    {
      name: "private",
      icon: Lock,
      description: "Only you can see the post",
    },
  ];

  return (
    <TasksComponent
      description={"Post Privacy"}
      open={isChangePrivacy}
      setOpen={setIsChangePrivacy}
    >
      <Typography
        fontSize="16px"
        color={palette.text.secondary}
        sx={{ userSelect: "none" }}
      >
        Who can see your post?
      </Typography>

      {privacyArray.map((prv, index) => (
        <Button
          key={index}
          sx={{
            userSelect: "none",
            cursor: "pointer",
            textTransform: "capitalize",
            mb: "7px",
            gap: "14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: "unset",
            ":hover": {
              background: "#8080802e",
            },
          }}
          onClick={() => setPostPrivacy(prv.name)}
        >
          <Box
            mb="7px"
            gap="14px"
            display="flex"
            alignItems="center"
            justifyContent="start"
          >
            <prv.icon
              sx={{
                background: "#4b4b4b",
                width: "40px",
                height: "40px",
                borderRadius: " 50%",
                padding: "8px",
                color: "white",
              }}
            />

            <Box>
              <Typography fontSize="18px" width="fit-content">
                {prv.name}
              </Typography>

              <Typography
                fontSize="13px"
                color={palette.text.secondary}
                width="fit-content"
              >
                {prv.description}
              </Typography>
            </Box>
          </Box>

          <Box
            padding="4px"
            borderRadius="50%"
            backgroundColor={prv.name === postPrivacy ? "#74b5ff" : "#636567"}
            outline={`3px solid ${
              prv.name === postPrivacy ? "#74b5ff" : "#636567"
            }`}
            width="9px"
            height="9px"
            border={"4px solid" + palette.neutral.light}
          ></Box>
        </Button>
      ))}

      <Box alignSelf="end" flex="1" alignContent="flex-end" marginBottom="10px">
        <Button
          sx={{ mr: "5px", width: "117px" }}
          onClick={() => setIsChangePrivacy(false)}
        >
          cancel
        </Button>

        <Button
          disabled={!postPrivacy || changePrivacyLoading}
          sx={{ color: "white", background: "#0866ff", width: "117px" }}
          onClick={() => handleChangePrivacy(postPrivacy)}
        >
          {changePrivacyLoading ? "Loading..." : "save"}
        </Button>
      </Box>
    </TasksComponent>
  );
};

export default ChangePrivacy;
