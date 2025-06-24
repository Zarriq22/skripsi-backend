const multer = require('multer');

// Konfigurasi storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder penyimpanan
  },
  filename: function (req, file, cb) {
    // Simpan file pakai nama asli
    cb(null, file.originalname); 
  }
});

const upload = multer({ storage });

module.exports = upload;