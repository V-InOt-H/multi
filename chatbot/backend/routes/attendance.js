const router = require("express").Router();
const { sessions } = require("../store");
const { authMiddleware } = require("../middleware/auth");
const { rbac } = require("../middleware/rbac");

router.get("/", authMiddleware, rbac("teacher"), (req, res) => {
  const teacherId = req.user.id;
  const allSessions = [...sessions.values()].filter(s => s.teacherId === teacherId);
  
  // Aggregate data by month and student
  const report = allSessions.map(s => ({
    sessionId: s.sessionId,
    title: s.title,
    date: s.startTime,
    month: new Date(s.startTime).toLocaleString("default", { month: "long", year: "numeric" }),
    attendees: s.attendance || []
  }));

  // Unique list of all students seen in these sessions
  const studentNames = [...new Set(report.flatMap(r => r.attendees))];

  res.json({
    report,
    studentNames,
  });
});

module.exports = router;
