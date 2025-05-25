const express = require('express');
const router = express.Router();
const { 
    getAllAddress,
    getAddressByAddressId,
    addAddress,
    updateAddress,
    deleteAddressById,
    deleteAddress
 } = require('../controllers/addressController');

router.get('/', getAllAddress);
router.get('/addressById/:userId', getAddressByAddressId);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.delete('/addressId/:id', deleteAddressById);

module.exports = router;