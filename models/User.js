const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  initialName: {
    type: String
  },
  avatar: {
    type: String
  },
  userType: {
    type: Number,
    default: 2
  }
});

module.exports = mongoose.model('User', userSchema);