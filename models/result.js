const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
  name: String,
  marks: Number,
  total: Number,
  grade: String,
  kt: Boolean
});

const semesterSchema = new mongoose.Schema({
  semesterNumber: Number,
  sgpa: Number,
  subjects: [subjectSchema]
});

const resultSchema = new mongoose.Schema({
 userId: {
  type: String,
  required: true,
  index: true
},
  cgpa: Number,
  totalKT: Number,
  semesters: [semesterSchema]
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);