import { Box, useTheme } from "@mui/system";

/* eslint-disable react/prop-types */
const PostImg = ({
  setIsPostClicked,
  setPostClickData,
  ele,
  setPostClickType,
}) => {
  const { palette } = useTheme();

  return (
    <Box
      maxHeight="485px"
      bgcolor={
        ele?.picturePath.length > 1
          ? palette.background.alt
          : palette.neutral.light
      }
      mt="10px"
      display="grid"
      gap="5px"
      gridTemplateColumns={
        ele?.picturePath.length > 1 ? "repeat(4, minmax(0, 1fr))" : undefined
      }
    >
      {ele?.picturePath?.map((mg, index) => {
        return (
          <img
            key={mg}
            src={mg}
            alt="post"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              gridColumn:
                ele.picturePath.length === 3 && index === 0
                  ? "span 4"
                  : "span 2",
              maxHeight: ele?.picturePath?.length > 2 ? "240px" : "485px",
              maxWidth: "100%",
              cursor: "pointer",
              zIndex: "1",
            }}
            className={ele?.picturePath.length > 1 && "opacityBox"}
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
