const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware/authMiddleware");
const courseController = require("../controllers/courseController");

router.get("/allcourses", isLoggedIn, courseController.getAllCourses);

module.exports = router;