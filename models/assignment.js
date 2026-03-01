const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    index: true
  },
userId: {
  type: String,
  required: true,
  index: true
},
  title: String,
  courseName: String,
  alternateLink: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  },
  completedAt: Date
}, { timestamps: true });

assignmentSchema.index({ googleId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", assignmentSchema);