const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  title: String,

  year: String,
  branch: String,
  semester: String,
  subject: String,
  module: String,
  session: String,

  // normalized fields (for case-insensitive checking)
  yearLower: String,
  branchLower: String,
  semesterLower: String,
  subjectLower: String,
  moduleLower: String,
  sessionLower: String,

  fileUrl: String,
  uploadedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("Note", noteSchema);