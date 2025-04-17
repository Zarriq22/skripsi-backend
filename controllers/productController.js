const Product = require('../models/Product');

// GET semua produk
const getAllProducts = async (req, res) => {
  const products = await Product.find();
  res.json(products);
};

// POST produk baru
const addProduct = async (req, res) => {
  const { name, price } = req.body;
  const product = new Product({ name, price });
  await product.save();
  res.status(201).json({ message: 'Produk disimpan', data: product });
};

// PUT: Update produk
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price } = req.body;

  try {
    const updated = await Product.findByIdAndUpdate(
      id,
      { name, price },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({ message: 'Produk diperbarui', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update', error });
  }
};

// DELETE: Hapus produk
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Produk tidak ditemukan' });
    }

    res.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus', error });
  }
};

module.exports = {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct
};