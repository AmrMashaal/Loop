/* eslint-disable react/prop-types */
const PostImg = ({
  setIsPostClicked,
  setPostClickData,
  ele,
  setPostClickType,
}) => {
  return (
    <img
      src={ele.picturePath}
      alt="Post Picture"
      style={{
        maxHeight: "560px",
        objectFit: "cover",
        margin: "10px 0 10px 0",
        cursor: "pointer",
        backgroundColor: "gray",
        userSelect: "none",
        zIndex: "11",
        position: "relative",
      }}
      width="100%"
      onClick={() => {
        setIsPostClicked(true),
          setPostClickType("post"),
          setPostClickData({
            firstName: ele?.userId?.firstName,
            lastName: ele?.userId?.lastName,
            picturePath: ele?.picturePath,
            userPicturePath: ele?.userId?.picturePath,
            description: ele.description,
            _id: ele?._id,
            userId: ele?.userId?._id,
            verified: ele?.userId?.verified,
          });
      }}
    />
  );
};

export default PostImg;
