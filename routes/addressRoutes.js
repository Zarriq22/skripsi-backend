const express = require('express');
const router = express.Router();
const { 
    getAllAddress,
    addAddress,
    updateAddress,
    deleteAddressById,
    deleteAddress
 } = require('../controllers/addressController');

router.get('/', getAllAddress);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.delete('/addressId/:id', deleteAddressById);

module.exports = router;