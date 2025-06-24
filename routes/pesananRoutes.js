const express = require('express');
const router = express.Router();
const {
    getAllPesanan,
    getPesananByUserId,
    addPesanan,
    updateStatusPesanan,
    deleteAllPesanan
} = require('../controllers/pesananController');

router.get('/', getAllPesanan);
router.get('/:userId', getPesananByUserId);
router.post('/', addPesanan);
router.put('/:id', updateStatusPesanan);
router.delete('/', deleteAllPesanan);

module.exports = router;