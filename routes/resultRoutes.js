const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } , fileFilter :(req, file, cb) => {
  if(file.mimetype === "application/pdf") {
  cb(null, true);
} else {
  cb(new Error("Only PDF allowed"));
}
}}); // 5MB limit

const { isLoggedIn } = require("../middleware/authMiddleware");
const resultController = require("../controllers/resultController");

router.get("/results", isLoggedIn, resultController.getResults);

router.post("/upload-result",
  isLoggedIn,
  upload.single("resultPdf"),
  resultController.uploadResult
);

module.exports = router;