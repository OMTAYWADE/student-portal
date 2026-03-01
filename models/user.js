const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true
  },
  name: String,
  email: String,
  accessToken: String,
refreshToken: String,
  lastSync: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);