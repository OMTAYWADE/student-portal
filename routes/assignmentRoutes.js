const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/authMiddleware");
const assignmentController = require("../controllers/assignmentController");
const Assignment = require("../models/assignment");

router.get("/assignments", isLoggedIn, assignmentController.getAssignments);
// Complete assignment
router.post(
  "/assignments/:id/complete",
  isLoggedIn,
  assignmentController.complete
);

// Undo assignment
router.post(
  "/assignments/:id/undo",
  isLoggedIn,
  assignmentController.undo
);

module.exports = router;