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
const aiRoutes = require('./routes/aiRoutes')

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/ai', aiRoutes)
const roomCodeMap = new Map();
const roomLanguageMap = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`${socket.id} joined ${roomId}`);

    // Persist code state: Send the room's current code back to the user upon joining
    if (roomCodeMap.has(roomId)) {
      socket.emit("receive-code", roomCodeMap.get(roomId));
    }

    // Persist language state: Send the room's selected language back to the user upon joining
    if (roomLanguageMap.has(roomId)) {
      socket.emit("receive-language", roomLanguageMap.get(roomId));
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    roomCodeMap.set(roomId, code);
    socket.to(roomId).emit("receive-code", code);
  });

  socket.on("language-change", ({ roomId, language }) => {
    roomLanguageMap.set(roomId, language);
    socket.to(roomId).emit("receive-language", language);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
  socket.on("send-message",(data) => {
    socket.to(data.roomId).emit("receive-message",data);
  }
);
});
server.listen(8080, () => {
  console.log("Server running on port 8080");
});

