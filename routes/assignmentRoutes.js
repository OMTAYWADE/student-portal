const express = require("express");
const router = express.Router();
const Assignment = require("../models/assignment");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.post("/assignments/:id/complete", isLoggedIn, async (req, res) => {
  await Assignment.findByIdAndUpdate(req.params.id, {
    status: "completed",
    completedAt: new Date()
  });
  res.json({ success: true });
});

router.post("/assignments/:id/undo", isLoggedIn, async (req, res) => {
  await Assignment.findByIdAndUpdate(req.params.id, {
    status: "pending",
    completedAt: null
  });
  res.json({ success: true });
});

module.exports = router;