require('dotenv').config()
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const connectDB = require('./config/db')

connectDB()

const authRoutes = require('./routes/authRoutes')

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    console.log(`${socket.id} joined ${roomId}`);
  });

  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("receive-code", code);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
server.listen(8080, () => {
  console.log("Server running on port 8080");
});

