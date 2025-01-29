/* eslint-disable react/prop-types */
const PostImg = ({ setIsPostClicked, setPostClickData, ele }) => {
  return (
    <img
      src={`${import.meta.env.VITE_API_URL}/assets/${ele.picturePath}`}
      alt="Post Picture"
      style={{
        maxHeight: "560px",
        objectFit: "cover",
        margin: "10px 0 10px 0",
        borderRadius: "0.75rem",
        cursor: "pointer",
        backgroundColor: "gray",
        userSelect: "none",
        zIndex: "11",
        position: "relative"
      }}
      width="100%"
      onClick={() => {
        setIsPostClicked(true),
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
