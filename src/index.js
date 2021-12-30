const path = require("path");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const Filter = require("bad-words");
const { generateMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");
const publicDir = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on("connection", (socket) => {
  socket.on("join", ({ userName, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, userName, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit(
      "message",
      generateMessage(`Admin`, `Welcome ${user.userName}.`)
    );

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        generateMessage(`Admin`, `${user.userName} has joined!`)
      );

    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
      disconnect: false,
    });
    callback();
  });

  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("profanity is banned.");
    }

    io.to(user.room).emit("message", generateMessage(user.userName, message));
    callback();
  });

  socket.on("sendLocation", (latitude, longitude) => {
    const user = getUser(socket.id);
    io.to(user.room).emit(
      "myLocation",
      generateMessage(
        user.userName,
        `https://google.com/maps/@${latitude},${longitude}`
      )
    );
  });

  socket.on("disconnect", (reason) => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`Admin`, `${user.userName} has left!`)
      );
      io.to(user.room).emit("roomDataDis", {
        room: user.room,
        users: getUsersInRoom(user.room),
        disconnect: true,
      });
    }
  });
});
app.use(express.static(publicDir));
const PORT = process.env.PORTS || 3000;
server.listen(PORT, () => console.log("listing on port " + PORT));
