const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { users } = require("../store");
const { JWT_SECRET } = require("../middleware/auth");

// Teacher login
router.post("/teacher/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = users.get(email);
    if (!user || user.role !== "teacher") {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email, role: "teacher", name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, userId: user.id, name: user.name, role: "teacher" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Teacher register
router.post("/teacher/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: "All fields required" });
    if (users.has(email)) return res.status(400).json({ error: "Email already registered" });
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    users.set(email, { id, email, passwordHash, role: "teacher", name });
    const token = jwt.sign({ id, email, role: "teacher", name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, userId: id, name, role: "teacher" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Student register (with full profile)
router.post("/student/register", async (req, res) => {
  try {
    const { name, email, studentId, year, course, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Name, email and password required" });
    if (users.has(email)) return res.status(400).json({ error: "Email already registered" });
    const id = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    users.set(email, { id, email, passwordHash, role: "student", name, studentId, year, course });
    const token = jwt.sign({ id, email, role: "student", name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, userId: id, name, role: "student" });
  } catch (err) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Student login by email + password
router.post("/student/login-email", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password required" });
    const user = users.get(email);
    if (!user || user.role !== "student") return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email, role: "student", name: user.name }, JWT_SECRET, { expiresIn: "24h" });
    res.json({ token, userId: user.id, name: user.name, role: "student" });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

// Student join by name + room code (quick join, no password)
router.post("/student/login", async (req, res) => {
  try {
    const { name, roomCode } = req.body;
    if (!name || !roomCode) return res.status(400).json({ error: "Name and room code required" });
    const id = uuidv4();
    const token = jwt.sign({ id, name, role: "student", roomCode }, JWT_SECRET, { expiresIn: "12h" });
    res.json({ token, userId: id, name, role: "student", roomCode });
  } catch (err) {
    res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
