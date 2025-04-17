const mongoose = require('mongoose');

const AvatarSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    unique: true 
  },
  avatar: { 
    type: String, 
    required: true 
    }, // base64 string
});

module.exports = mongoose.model('Avatar', AvatarSchema);