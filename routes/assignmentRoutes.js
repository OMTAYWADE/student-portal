const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/authMiddleware");
const assignmentController = require("../controllers/assignmentController");

router.get("/assignments", isLoggedIn, async (req, res) => {

  const filter = { userId: req.user.id };

  if (req.query.course) {
    filter.courseName = req.query.course;
  }

  const assignments = await Assignment.find(filter);

  res.render("assignments", {
    user: req.user,
    assignments
  });
});
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