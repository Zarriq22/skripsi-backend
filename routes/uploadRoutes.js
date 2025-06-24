const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getAllUploads, uploadFile, updateUpload, getUploadsByProduct, deleteAllUploads, deleteUploadByProductId } = require('../controllers/uploadController');

// Konfigurasi multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

router.get('/', getAllUploads);
router.get('/product/:productId', getUploadsByProduct);

router.post('/', upload.array('file'), uploadFile);

router.put('/:id', upload.array('file'), updateUpload);

router.delete('/', deleteAllUploads);
router.delete('/product/:productId', deleteUploadByProductId);

module.exports = router;