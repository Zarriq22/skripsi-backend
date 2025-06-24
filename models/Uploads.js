const mongoose = require('mongoose');

const UploadSchema = new mongoose.Schema({
  files: [
    {
      filename: String,
      path: String
    }
  ],
  productId: {
    type: String,
  },
  userId: {
    type: String
  }
}, { timestamps: true });

const Upload = mongoose.model('Upload', UploadSchema);
module.exports = Upload;