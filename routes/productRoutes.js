const express = require('express');
const router = express.Router();
const {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByWishListId
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.get('/wishlist/:id', getProductByWishListId);

router.post('/', addProduct);

router.put('/:id', updateProduct);   

router.delete('/:id', deleteProduct); 

module.exports = router;