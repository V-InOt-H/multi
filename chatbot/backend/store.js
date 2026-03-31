// In-memory data store — no external DB required
const users = new Map();
const sessions = new Map();
const attendances = new Map();
const quizzes = new Map();

// Seed a demo teacher account
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const demoTeacherId = uuidv4();
users.set("teacher@demo.com", {
  id: demoTeacherId,
  email: "teacher@demo.com",
  passwordHash: bcrypt.hashSync("demo1234", 10),
  role: "teacher",
  name: "Demo Teacher",
});


// Mock Attendance Data
const jan = new Date(2024, 0, 10).toISOString();
const feb = new Date(2024, 1, 15).toISOString();
const mar = new Date(2024, 2, 20).toISOString();

sessions.set("mock-1", {
  sessionId: "mock-1", teacherId: demoTeacherId, title: "Intro to AI", startTime: jan, isActive: false,
  attendance: ["Student A", "Student B", "Student C"]
});
sessions.set("mock-2", {
  sessionId: "mock-2", teacherId: demoTeacherId, title: "Neural Networks", startTime: feb, isActive: false,
  attendance: ["Student A", "Student C"]
});
sessions.set("mock-3", {
  sessionId: "mock-3", teacherId: demoTeacherId, title: "Deep Learning", startTime: mar, isActive: false,
  attendance: ["Student B", "Student C", "Student D"]
});

const notebooks = new Map();

const studentActivity = new Map(); // studentId -> Set of date strings

module.exports = { users, sessions, attendances, quizzes, notebooks, studentActivity };
