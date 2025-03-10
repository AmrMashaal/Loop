/* eslint-disable react/prop-types */
const PostImg = ({
  setIsPostClicked,
  setPostClickData,
  ele,
  isRepost,
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
        borderRadius: isRepost ? "0.75rem 0.75rem 0 0" : "0.75rem",
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
            firstName: ele.firstName,
            lastName: ele.lastName,
            picturePath: ele.picturePath,
            userPicturePath: ele.userPicturePath,
            description: ele.description,
            _id: ele._id,
            userId: ele.userId,
            verified: ele.verified,
          });
      }}
    />
  );
};

export default PostImg;
