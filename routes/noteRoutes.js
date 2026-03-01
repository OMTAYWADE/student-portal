const express = require("express");
const router = express.Router();
const noteController = require("../controllers/noteController");
const { isLoggedIn } = require("../middleware/authMiddleware");

// Public Hub
router.get("/notes", noteController.home);

// Personal Dashboard
router.get("/notes/dashboard", isLoggedIn, noteController.dashboard);

// Browse Structure
router.get("/notes/browse", noteController.getYears);
router.get("/notes/browse/:year", noteController.getBranches);
router.get("/notes/browse/:year/:branch", noteController.getSemesters);
router.get("/notes/browse/:year/:branch/:sem", noteController.getSubjects);
router.get("/notes/browse/:year/:branch/:sem/:subject", noteController.getModules);
router.get("/notes/browse/:year/:branch/:sem/:subject/:module", noteController.getFiles);

// Upload
router.get("/upload-notes", isLoggedIn, noteController.uploadPage);
router.post("/upload-notes", isLoggedIn, noteController.uploadNote);

module.exports = router;