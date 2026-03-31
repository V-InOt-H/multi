const router = require("express").Router();
const { studentActivity } = require("../store");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, (req, res) => {
  const { id, name, email } = req.user;
  const identifier = email || name; // email for registered, name for guest
  
  if (!identifier) return res.status(401).json({ error: "Unauthorized" });

  const dates = studentActivity.get(identifier);
  if (!dates || dates.size === 0) {
    return res.json({ streak: 0, lastActive: null });
  }

  const sortedDates = [...dates].sort((a, b) => new Date(b) - new Date(a));
  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let currentCheck = new Date(today);

  // Check today or yesterday as start
  const lastActiveDate = new Date(sortedDates[0]);
  lastActiveDate.setHours(0, 0, 0, 0);

  const diffDays = (today - lastActiveDate) / (1000 * 60 * 60 * 24);

  if (diffDays > 1) {
    // Streak broken
    return res.json({ streak: 0, lastActive: sortedDates[0] });
  }

  // Calculate back from lastActiveDate
  currentCheck = lastActiveDate;
  
  for (let i = 0; i < sortedDates.length; i++) {
    const d = new Date(sortedDates[i]);
    d.setHours(0, 0, 0, 0);
    
    if (d.getTime() === currentCheck.getTime()) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else if (d.getTime() < currentCheck.getTime()) {
      // Gap found
      break;
    }
  }

  res.json({ streak, lastActive: sortedDates[0] });
});

module.exports = router;
