const webSockets = (io) => {
  let connectedUsers = []; //in call

  let groupId;

  // let userWithPermission = [];

  const addUser = (user, socket) => {
    const alreadyJoined = connectedUsers.some((u) => u.uid === user.userId);

    !alreadyJoined &&
      connectedUsers.push({
        username: user.userName,
        uid: user.userId,
        socketId: socket.id,
        video: user.video,
        audio: user.audio,
        groupId: user.groupId,
      });
  };

  const removeUser = (id) => {
    const filteredUser = connectedUsers.filter((user) => user.socketId !== id);
    connectedUsers = filteredUser;
  };

  const userInGroup = (arr, groupId) => {
    const filtered = arr.filter((a) => a.groupId === groupId);
    return filtered;
  };

  const users = {};

  const socketToRoom = {};

  io.on("connection", (socket) => {
    var query = socket.handshake.query;
    var roomName = query.roomName;

    if (roomName) {
      socket.join(roomName);
    }

    socket.on("chat", (data) => {
      socket.to(roomName).emit("stoped-typing");
      io.to(roomName).emit("chat-sent", data); // emitting to other sockets
    });

    socket.on("type", (data) => {
      if (data.msg !== "") {
        socket.to(roomName).emit("someone-typing", data);
      } else {
        socket.to(roomName).emit("stoped-typing");
      }
    });

    socket.on("answerCall", (data) => {
      io.to(roomName).emit("callAccepted", data.signal);
    });

    socket.on("currentUsers", () => {
      io.to(roomName).emit(
        "currentUsers",
        userInGroup(connectedUsers, roomName)
      );
    });

    socket.on("user-leave", ({ groupId, uid }) => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomName];

      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
        const usersInThisRoom = users[roomID].filter((d) => {
          return d.user !== uid;
        });

        users[roomID] = usersInThisRoom;
        io.to(roomName).emit("all users", usersInThisRoom);
      }

      removeUser(socket.id);
      socket.to(roomName).emit("callEnded");
      socket.to(roomName).emit("stoped-typing");
      io.to(roomName).emit("currentUsers", connectedUsers);
    });

    socket.on("open-board", (user) => {
      io.to(roomName).emit("board-opened", user.username);
    });

    socket.on("drawing", (data) => {
      socket.to(roomName).emit("reflect-drawing", data);
    });

    //video call

    //new

    socket.on("join room", ({ roomID, uid, name }) => {
      let alreadyJoined =
        users[roomID] && users[roomID].filter((user) => user.user === uid);

      let data = {
        socketId: socket.id,
        user: uid,
        name: name,
        video: true,
        audio: true,
      };
      if (users[roomID]) {
        let userExists = users[roomID].some((user) => user.user === data.user);
        if (!userExists) {
          users[roomID].push(data);
        }
      } else {
        users[roomID] = [data];
      }

      socketToRoom[socket.id] = roomID;
      const usersInThisRoom = users[roomID];
      console.log("all users", usersInThisRoom);
      io.to(roomName).emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", (payload) => {
      // console.log("joined : ", payload.callerID);
      // console.log("----");
      socket.to(roomName).emit("user joined", {
        signal: payload.signal,
        callerID: payload.callerID,
      });
    });

    socket.on("returning signal", (payload) => {
      console.log("users", users[roomName]);
      socket.to(roomName).emit("receiving returned signal", {
        signal: payload.signal,
        id: socket.id,
      });
    });
    socket.on("disconnect", () => {
      const roomID = socketToRoom[socket.id];
      let room = users[roomID];

      if (room) {
        room = room.filter((id) => id !== socket.id);
        users[roomID] = room;
        const usersInThisRoom = users[roomID].filter((d) => {
          return d.socketId !== socket.id;
        });

        users[roomID] = usersInThisRoom;
        io.to(roomName).emit("all users", usersInThisRoom);
      }

      removeUser(socket.id);
      socket.to(roomName).emit("callEnded");
      socket.to(roomName).emit("stoped-typing");
      io.to(roomName).emit("currentUsers", connectedUsers);
    });
  });
};

export default webSockets;
