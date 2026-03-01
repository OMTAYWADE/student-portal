const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const { isLoggedIn } = require("../middleware/authMiddleware");
const resultController = require("../controllers/resultController");

router.get("/results", isLoggedIn, resultController.getResults);

router.post("/upload-result",
  isLoggedIn,
  upload.single("resultPdf"),
  resultController.uploadResult
);

module.exports = router;