const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/authMiddleware");
const assignmentController = require("../controllers/assignmentController");
const Assignment = require("../models/assignment");

router.get("/assignments", isLoggedIn, assignmentController.getAssignments);

// Complete assignment
exports.complete = async (req, res, next) => {
  try {
    await Assignment.findByIdAndUpdate(req.params.id, {
      status: "completed",
      completedAt: new Date()
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// UNDO assignment
exports.undo = async (req, res, next) => {
  try {
    await Assignment.findByIdAndUpdate(req.params.id, {
      status: "pending",
      completedAt: null
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};


module.exports = router;