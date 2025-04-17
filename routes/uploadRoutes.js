const express = require('express');
const router = express.Router();
const { getAllImages, getImageByUserId, uploadImage } = require('../controllers/uploadController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', getAllImages)
router.get('/:userId', getImageByUserId);
router.post('/images', verifyToken, uploadImage);

module.exports = router;