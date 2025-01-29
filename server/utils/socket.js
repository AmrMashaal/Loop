const onlineUsers = {};

export const initSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("userOnline", async (data) => {
      onlineUsers[data.userId] = socket.id;

      await fetch(
        `${process.env.FRONTEND_FETCHING_LINK}/users/${data.userId}/onlineState`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            makeOnline: true,
          }),
        }
      );
    });

    // --------------------------------------------------------

    socket.on("sendMessage", (data) => {
      socket
        .to(onlineUsers[data.receivedId])
        .emit("receiveMessage", data.message);
    });

    // --------------------------------------------------------

    socket.on("newPost", async (data) => {
      io.emit("notification", data);
    });

    // --------------------------------------------------------

    socket.on("notifications", async (data) => {
      if (data.notification.type !== "newPost") {
        socket
          .to(onlineUsers[data.receiverId])
          .emit("getNotifications", data.notification);
      }
      // ------------------------------------------------------
      else if (data.notification.type === "newPost") {
        for (const friend in data.friends) {
          const response = await fetch(
            `${process.env.FRONTEND_FETCHING_LINK}/notifications/${data._id}/${data.friends[friend]._id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${data.token}`,
              },

              body: JSON.stringify({
                type: "newPost",
                description: `${data.firstName} shared a new post`,
                linkId: data.postId,
                receiverId: data.friends[friend]._id,
                senderId: data._id,
              }),
            }
          );

          const notification = await response.json();

          console.log(
            onlineUsers[
              data?.friends[friend]?.sender?._id === data?._id
                ? data?.friends[friend]?.receiver?._id.toString()
                : data?.friends[friend]?.sender?._id.toString()
            ]
          );

          socket
            .to(onlineUsers[data.friends[friend]._id])
            .emit("friendNewPost", notification);
        }
      }
    });

    // --------------------------------------------------------

    socket.on("disconnect", async () => {
      const userId = Object.keys(onlineUsers).find((key) => {
        return onlineUsers[key] === socket.id;
      });

      if (userId) {
        delete onlineUsers[userId];
      }

      await fetch(
        `${process.env.FRONTEND_FETCHING_LINK}/users/${userId}/onlineState`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            makeOnline: false,
          }),
        }
      );
    });
  });
};
