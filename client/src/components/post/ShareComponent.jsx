/* eslint-disable react/prop-types */
import { Box } from "@mui/system";
import TasksComponent from "../TasksComponent";
import { Button, InputBase, Typography } from "@mui/material";
import UserImage from "../UserImage";
import { useState } from "react";
import { Lock, People, Public } from "@mui/icons-material";

const ShareComponent = ({
  isShare,
  setIsShare,
  postInfo,
  setPostInfo,
  user,
  neutralColor,
  handleSubmit,
  repostLoading,
}) => {
  const [description, setDescription] = useState("");
  const [privacy, setPrivacy] = useState("public");
  const [isShowPrivacy, setIsShowPrivacy] = useState(false);

  return (
    <TasksComponent
      description="Share"
      minHeight="270px"
      open={isShare}
      setOpen={setIsShare}
    >
      <Box display="flex" gap="10px">
        <Box sx={{ userSelect: "none", pointerEvents: "none" }}>
          <UserImage image={user.picturePath} size="50" />
        </Box>

        <Box>
          <Typography fontWeight="500">
            {user.firstName} {user.lastName}
          </Typography>

          <Box
            display="flex"
            alignItems="center"
            gap="4px"
            borderRadius="5px"
            border="1px solid gray"
            p="2px 5px"
            position="relative"
            sx={{ cursor: "pointer", userSelect: "none" }}
            onClick={() => setIsShowPrivacy(!isShowPrivacy)}
          >
            {privacy === "public" ? (
              <Public sx={{ fontSize: "16px", color: "text.secondary" }} />
            ) : privacy === "friends" ? (
              <People sx={{ fontSize: "16px", color: "text.secondary" }} />
            ) : (
              <Lock sx={{ fontSize: "16px", color: "text.secondary" }} />
            )}
            <Typography variant="body2" color="text.secondary">
              {privacy}
            </Typography>

            <Box
              sx={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: "8px solid gray",
              }}
            />

            {isShowPrivacy && (
              <Box position="absolute" zIndex="1" top="20px" right="0">
                <Box
                  display="flex"
                  flexDirection="column"
                  gap="5px"
                  borderRadius="5px"
                  border="1px solid gray"
                  overflow="hidden"
                  sx={{ backgroundColor: neutralColor }}
                >
                  {["public", "friends", "private"].map((item) => (
                    <Box
                      display="flex"
                      alignItems="center"
                      gap="4px"
                      p="5px"
                      sx={{
                        cursor: "pointer",
                        userSelect: "none",
                        ":hover": {
                          bgcolor: "#5353534d",
                        },
                      }}
                      onClick={() => {
                        setPrivacy(item);
                        setIsShowPrivacy(false);
                      }}
                      key={item}
                    >
                      {item === "public" ? (
                        <Public
                          sx={{ fontSize: "16px", color: "text.secondary" }}
                        />
                      ) : item === "friends" ? (
                        <People
                          sx={{ fontSize: "16px", color: "text.secondary" }}
                        />
                      ) : (
                        <Lock
                          sx={{ fontSize: "16px", color: "text.secondary" }}
                        />
                      )}

                      <Typography variant="body2" color="text.secondary">
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <form
        style={{
          marginTop: "-7px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
        onSubmit={(e) => {
          if (!repostLoading) {
            handleSubmit(e, privacy, description);
          }
        }}
      >
        <InputBase
          placeholder="Say something about this..."
          fullWidth
          multiline
          maxRows="2"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        />

        <Button
          sx={{
            color: "white",
            background: "#0866ff",
            width: "117px",
            alignSelf: "end",
          }}
          type="submit"
          disabled={repostLoading}
        >
          {repostLoading ? "Loading..." : "Share"}
        </Button>
      </form>
    </TasksComponent>
  );
};

export default ShareComponent;
