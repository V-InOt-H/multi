require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT]", err.message);
});
process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED REJECTION]", reason);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { sessions, studentActivity } = require("./store");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" }, maxHttpBufferSize: 10e6 });

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/sessions",      require("./routes/sessions"));
app.use("/api/transcription", require("./routes/transcription"));
app.use("/api/translation",   require("./routes/translation"));
app.use("/api/summary",       require("./routes/summary"));
app.use("/api/quiz",          require("./routes/quiz"));
app.use("/api/tts",           require("./routes/tts"));
app.use("/api/video",         require("./routes/video"));
app.use("/api/attendance",    require("./routes/attendance"));
app.use("/api/notebooks",     require("./routes/notebooks"));
app.use("/api/streak",        require("./routes/streak"));
app.use("/uploads",           express.static(require("path").join(__dirname, "uploads")));

app.get("/api/health", (req, res) => res.json({ status: "ok", timestamp: new Date().toISOString() }));

// Track connected students per room
const roomStudents = new Map(); // roomCode -> Map<socketId, {name, joinTime, confusionCount, lastActive}>

io.on("connection", (socket) => {
  let currentRoom = null;
  let currentRole = null;
  let currentName = null;

  socket.on("join_room", ({ roomCode, name, role }) => {
    socket.join(roomCode);
    currentRoom = roomCode;
    currentRole = role;
    currentName = name;

    if (role === "student") {
      // Record student activity for daily streak
      const identifier = name; // simplified for quick join, in real app would use email from JWT
      if (!studentActivity.has(identifier)) studentActivity.set(identifier, new Set());
      const today = new Date().toISOString().split("T")[0];
      studentActivity.get(identifier).add(today);
      if (!roomStudents.has(roomCode)) roomStudents.set(roomCode, new Map());
      roomStudents.get(roomCode).set(socket.id, {
        name, socketId: socket.id, joinTime: Date.now(), confusionCount: 0, lastActive: Date.now()
      });
      io.to(roomCode).emit("student_joined", {
        name, socketId: socket.id, time: Date.now(),
        totalStudents: roomStudents.get(roomCode).size,
      });
      io.to(roomCode).emit("attendance_update", {
        students: [...(roomStudents.get(roomCode)?.values() || [])],
      });
    }
  });

  socket.on("transcript_chunk", (data) => {
    // Save to session
    const session = [...sessions.values()].find(s => s.roomCode === data.roomCode && s.isActive);
    if (session) {
      session.transcript.push({ text: data.text, timestamp: data.timestamp || Date.now(), speakerId: data.speakerId || "teacher" });
    }
    io.to(data.roomCode).emit("transcript_update", data);
  });

  socket.on("video_chunk", (data) => {
    io.to(data.roomCode).emit("video_chunk", data);
  });

  socket.on("student_confused", (data) => {
    const students = roomStudents.get(data.roomCode);
    if (students?.has(socket.id)) {
      students.get(socket.id).confusionCount++;
      students.get(socket.id).lastActive = Date.now();
    }
    io.to(data.roomCode).emit("confusion_alert", { ...data, name: currentName, socketId: socket.id, time: Date.now() });
    io.to(data.roomCode).emit("attendance_update", { students: [...(students?.values() || [])] });
  });

  socket.on("student_question", (data) => {
    io.to(data.roomCode).emit("student_question", { ...data, name: currentName, time: Date.now() });
  });

  socket.on("push_quiz", (data) => {
    io.to(data.roomCode).emit("quiz_pushed", data);
  });

  socket.on("push_summary", (data) => {
    io.to(data.roomCode).emit("summary_ready", data);
  });

  socket.on("lecture_started", (data) => {
    io.to(data.roomCode).emit("lecture_started", data);
  });

  socket.on("lecture_stopped", (data) => {
    const session = [...require("./store").sessions.values()].find(s => s.roomCode === data.roomCode && s.isActive);
    if (session) {
      const students = roomStudents.get(data.roomCode);
      if (students) {
        session.attendance = [...new Set([...(session.attendance || []), ...[...students.values()].map(s => s.name)])];
      }
    }
    io.to(data.roomCode).emit("lecture_stopped", data);
  });

  socket.on("translation_update", (data) => {
    io.to(data.roomCode).emit("translation_update", data);
  });

  socket.on("disconnect", () => {
    if (currentRoom && currentRole === "student") {
      roomStudents.get(currentRoom)?.delete(socket.id);
      io.to(currentRoom).emit("student_left", { name: currentName, socketId: socket.id, time: Date.now() });
      io.to(currentRoom).emit("attendance_update", {
        students: [...(roomStudents.get(currentRoom)?.values() || [])],
      });
    }
  });
});

const PORT = process.env.BACKEND_PORT || 3001;
server.listen(PORT, "localhost", () => {
  console.log(`Backend running on http://localhost:${PORT}`);
  console.log(`OpenAI API: ${process.env.OPENAI_API_KEY ? "configured" : "not set (AI features limited)"}`);
});
