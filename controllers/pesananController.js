const Pesanan = require('../models/Pesanan');

const getAllPesanan = async (req, res) => {
    try {
        const pesanan = await Pesanan.find();
        res.json(pesanan);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pesanan', error: error.message });
    }
};

const getPesananByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const pesanan = await Pesanan.find({ userId });

        res.json(pesanan);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengambil pesanan', error: error.message });
    }
};

const addPesanan = async (req, res) => {
    try {
        const { productName, productId, userId, price, image, description, status, alamat, kurir } = req.body;
        const pesanan = new Pesanan({ productName, productId, userId, price, image, description, status, alamat, kurir });
        
        await pesanan.save();
        
        res.status(201).json({ message: 'Pesanan berhasil dibuat', data: pesanan });
    } catch (error) {
        res.status(500).json({ message: 'Gagal membuat pesanan', error: error.message });
    }
};

const updateStatusPesanan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, resi } = req.body;

        const updated = await Pesanan.findByIdAndUpdate(
            id, 
            { status, resi }, 
            { new: true }
        );

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Gagal mengubah status pesanan', error: error.message });
    }
};

const deleteAllPesanan = async (req, res) => {
    try {
        await Pesanan.deleteMany({});
        res.json({ message: 'Semua pesanan berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus pesanan', error: error.message });
    }
};

module.exports = {
    getAllPesanan,
    getPesananByUserId,
    addPesanan,
    updateStatusPesanan,
    deleteAllPesanan
};