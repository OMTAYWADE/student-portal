const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const { isLoggedIn } = require("../middleware/authMiddleware");

router.get("/dashboard", isLoggedIn, dashboardController.getDashboard);
router.get("/assignNotification", isLoggedIn, dashboardController.getAssignNotification);

module.exports = router;