import { Box, useTheme } from "@mui/system";

/* eslint-disable react/prop-types */
const PostImg = ({
  setIsPostClicked,
  setPostClickData,
  ele,
  setPostClickType,
}) => {
  const { palette } = useTheme();

  const pictures = Array.isArray(ele?.picturePath)
    ? ele.picturePath
    : ele?.picturePath
    ? [ele.picturePath]
    : [];

  return (
    <Box
      maxHeight="485px"
      bgcolor={
        pictures.length > 1 ? palette.background.alt : palette.neutral.light
      }
      mt="10px"
      display="grid"
      gap="5px"
      gridTemplateColumns={
        pictures.length > 1 ? "repeat(4, minmax(0, 1fr))" : undefined
      }
    >
      {pictures?.map((mg, index) => {
        return (
          <img
            key={mg}
            src={mg}
            alt="post"
            style={{
              width: "100%",
              maxHeight: "485px",
              minHeight: "200px",
              objectFit: "contain",
              gridColumn:
                ele.picturePath.length === 3 && index === 0
                  ? "span 4"
                  : "span 2",
              maxWidth: "100%",
              cursor: "pointer",
              zIndex: "1",
            }}
            className={pictures.length > 1 && "opacityBox"}
            onClick={() => {
              setIsPostClicked(true),
                setPostClickType("post"),
                setPostClickData({
                  firstName: ele?.userId?.firstName,
                  lastName: ele?.userId?.lastName,
                  picturePath: mg,
                  userPicturePath: ele?.userId?.picturePath,
                  description: ele.description,
                  _id: ele?._id,
                  userId: ele?.userId?._id,
                  verified: ele?.userId?.verified,
                });
            }}
          />
        );
      })}
    </Box>
  );
};

export default PostImg;
