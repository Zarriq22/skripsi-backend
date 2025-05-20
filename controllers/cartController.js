const Cart = require('../models/Cart');

const getAllCarts = async (req, res) => {
    try {
        const carts = await Cart.find();
        res.json(carts);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil daftar keranjang', error });
    }
};

const getCartById = async (req, res) => {
    const { id } = req.params;

    try {
        const cart = await Cart.findById(id);
        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil keranjang', error });
    }
};

const addCart = async (req, res) => {
    const { userId, products } = req.body;

    try {
        const cart = new Cart({ userId, products });
        await cart.save();
        res.status(201).json({ message: 'Keranjang berhasil dibuat', data: cart });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat keranjang', error });
    }
};

const updateCart = async (req, res) => {
    const { id } = req.params;
    const { userId, products } = req.body;

    try {
        const cart = await Cart.findByIdAndUpdate(id, { userId, products }, { new: true });
        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
        }
        res.json({ message: 'Keranjang berhasil diperbarui', data: cart });
    } catch (error) {
        res.status(500).json({ message: 'Gagal memperbarui keranjang', error });
    }
};

const deleteCart = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Cart.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
        }
        res.json({ message: 'Keranjang berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus keranjang', error });
    }
};

const getCartByUserId = async (req, res) => {
    const { userId } = req.params;

    try {
        const cart = await Cart.find({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil keranjang', error });
    }
};  

const getCartByProductId = async (req, res) => {
    const { productId } = req.params;

    try {
        const cart = await Cart.find({ 'products.productId': productId });

        if (!cart) {
            return res.status(404).json({ message: 'Keranjang tidak ditemukan' });
        }

        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil keranjang', error });
    }
};  

module.exports = { 
    getAllCarts,
    getCartById,
    addCart,
    updateCart,
    deleteCart,
    getCartByUserId,
    getCartByProductId
};