const express = require('express');
const router = express.Router();
const { getAllCarts, getCartByUserId, getCartByProductId, addCart, updateCart, deleteCart } = require('../controllers/cartController');

router.get('/', getAllCarts);
router.get('/user/:userId', getCartByUserId);
router.get('/product/:productId', getCartByProductId);
router.post('/', addCart);
router.put('/:id', updateCart);
router.delete('/:id', deleteCart);

module.exports = router;