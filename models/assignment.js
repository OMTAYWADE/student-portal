const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true
    },
    userId: {
    type: String,
    required: true
    },
  title: String,
  courseName: String,
    dueDate: Date,
  alternateLink: String,

  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
    },
    priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
    },

  completedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);