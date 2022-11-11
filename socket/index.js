import { generateAttendanceReport } from "../controllers/report.js";

let activeUsers = []; // in app

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

const usersAttendance = {};

const socketToRoom = {};

const webSockets = (io, socket) => {
  var query = socket.handshake.query;
  var roomName = query.roomName;
  let email = query.email;

  let userExists = activeUsers.find((u) => u.email === email);
  if (!userExists) {
    let user = {
      socketId: socket.id,
      email,
    };
    activeUsers.push(user);
  } else {
    let userFiltered = activeUsers.map((u) => {
      if (u.email === userExists.email) {
        return {
          ...u,
          socketId: socket.id,
        };
      } else {
        return u;
      }
    });
    activeUsers = userFiltered;
  }

  if (roomName) {
    socket.join(roomName);
  }

  socket.on("chat", (data) => {
    socket.to(roomName).emit("stoped-typing");
    io.to(roomName).emit("chat-sent", data); // emitting to other sockets
  });

  socket.on("joined alert in chat", (data) => {
    io.to(data.groupId).emit("chat-sent", data); // emitting to other sockets
    io.to(data.groupId).emit("update members", data);
  });

  socket.on("left alert in chat", (data) => {
    io.to(data.groupId).emit("chat-sent", data); // emitting to other sockets
    io.to(data.groupId).emit("remove members", data);
  });

  socket.on("notification", (emails) => {
    activeUsers.map((user) => {
      if (emails.includes(user.email)) {
        socket.to(user.socketId).emit("notification alert", emails);
      }
    });
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
    io.to(roomName).emit("currentUsers", userInGroup(connectedUsers, roomName));
  });

  socket.on("open-board", (user) => {
    io.to(roomName).emit("board-opened", user.username);
  });

  socket.on("close-board", (user) => {
    io.to(roomName).emit("board-closed", user.username);
  });

  socket.on("drawing", (data) => {
    socket.to(roomName).emit("reflect-drawing", data);
  });

  //video sockets

  socket.on("user-leave", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    let attendance = usersAttendance[roomID];
    if (room) {
      room = room.filter((id) => id.socketId !== socket.id);
      attendance = attendance.map((el) => {
        if (el.socketId === socket.id) {
          return {
            ...el,
            left: new Date(),
          };
        }
        return el;
      });
      users[roomID] = room;
      usersAttendance[roomID] = attendance;
    }
    if (room < 1) {
      generateAttendanceReport(attendance);
    }
    socket.to(roomID).emit("user left", socket.id);
    socket
      .to(roomID)
      .emit("all users", { usersInThisRoom: room, users: users[roomID] });
  });

  socket.on("join room", ({ roomID, uid, name }) => {
    let data = {
      socketId: socket.id,
      user: uid,
      name: name,
      groupId: roomID,
    };
    if (users[roomID]) {
      const length = users[roomID].length;
      if (length === 45) {
        socket.emit("room full");
        return;
      }
      let userExistsOrNot = users[roomID].some((u) => u.user === uid);
      if (!userExistsOrNot) {
        users[roomID].push(data);
        usersAttendance[roomID].push({
          ...data,
          joined: new Date(),
          left: "",
        });
      }
    } else {
      users[roomID] = [data];
      usersAttendance[roomID] = [
        {
          ...data,
          joined: new Date(),
          left: "",
        },
      ];
    }
    console.log("joined", usersAttendance[roomID]);

    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = users[roomID].filter(
      (id) => id.socketId !== socket.id
    );
    console.log(users[roomID]);
    if (users[roomID].length < 2) {
      socket.broadcast.emit("call users", {
        groupId: roomID,
        uid,
        name,
      });
    }

    socket
      .to(roomID)
      .emit("all users", { usersInThisRoom, users: users[roomID] });
    socket.emit("total users", { usersInThisRoom, users: users[groupId] });
  });

  socket.on("group deleted", () => {
    socket.broadcast.emit("group was deleted");
  });

  socket.on("users in call", ({ groupId }) => {
    const usersInThisRoom = users[groupId]?.filter(
      (id) => id.socketId !== socket.id
    );
    socket
      .to(groupId)
      .emit("users in call", { usersInThisRoom, users: users[groupId] });
  });

  socket.on("sending signal", (payload) => {
    io.to(payload.userToSignal).emit("user joined", {
      signal: payload.signal,
      callerID: payload.callerID,
      user: payload.uid,
      name: payload.name,
    });
  });

  socket.on("returning signal", (payload) => {
    io.to(payload.callerID).emit("receiving returned signal", {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on("disconnect", () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    let attendance = usersAttendance[roomID];

    if (room) {
      room = room.filter((id) => id.socketId !== socket.id);
      attendance = attendance.map((el) => {
        if (el.socketId === socket.id) {
          return {
            ...el,
            left: new Date(),
          };
        }
        return el;
      });
      users[roomID] = room;
    }

    socket.broadcast.emit("user left", socket.id);
    socket
      .to(roomID)
      .emit("all users", { usersInThisRoom: room, users: users[roomID] });
  });

  socket.on("change", (payload) => {
    socket.broadcast.emit("change", payload);
  });
};

export default webSockets;
