const express = require('express');
const router = express.Router();
const {
    getAllPesanan,
    getPesananByUserId,
    addPesanan,
    updateStatusPesanan
} = require('../controllers/pesananController');

router.get('/', getAllPesanan);
router.get('/:userId', getPesananByUserId);
router.post('/', addPesanan);
router.put('/:id', updateStatusPesanan);

module.exports = router;