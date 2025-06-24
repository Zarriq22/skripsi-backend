const Product = require('../models/Product');
const Upload = require('../models/Uploads');
const getEmbedding = require('../utils/services/embedding');
const qdrant = require('../utils/services/qdrant');

const generateRandomNumericId = (length = 6) => {
  return Math.floor(Math.random() * Math.pow(10, length));
}
// GET semua produk
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();

    // Cari upload masing-masing produk pakai Promise.all agar paralel
    const productsWithImages = await Promise.all(products.map(async (product) => {
      const upload = await Upload.findOne({ productId: product._id }).lean();

      product.images = upload ? upload.files.map(f => ({
        filename: f.filename,
        path: f.path
      })) : [];

      return product;
    }));

    res.json(productsWithImages);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil produk', error: error.message });
  }
};

const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const produk = await Product.findById(id).lean();

    if (!produk) {
      return res.status(404).json({ message: 'produk tidak ditemukan' });
    }

    const upload = await Upload.findOne({ productId: id }).lean();

    // Attach data images ke produk, jika ada upload
    produk.image = upload ? upload.files.map(f => ({
      filename: f.filename,
      path: f.path
    })) : [];

    res.json(produk);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil produk', error: error.message });
  }
};

// POST produk baru
const addProduct = async (req, res) => {
  const { productName, price, stock, images, description,spesifikasi,wishList, wishListId, kategori, gender, rating, terjual } = req.body;
  const product = new Product({ productName, price, stock, images,description, spesifikasi,wishList, wishListId, kategori, gender, rating, terjual });

  await product.save();
  const products = [product];

  // 2. Dapatkan embedding dari deskripsi
  const points = await Promise.all(products.map(async (product, idx) => {
    const text = `${product.productName} ${product.description}`;
    const output = await getEmbedding(text);
    const vector = output; // ✅ Pastikan ini array of numbers

    return {
      id: generateRandomNumericId(),
      vector,
      payload: {
        productId: product._id.toString(),
        productName: product.productName || '',
        description: product.description || '',
        spesifikasi: product.spesifikasi || '',
        price: product.price || 0,
        stock: product.stock || 0,
        kategori: product.kategori || '',
        gender: product.gender || '',
      }
    };
  }));

  await qdrant.upsert('products', { points });
  const iQdrant = points[0].id 

  const response = await fetch(`${process.env.QDRANT_URL}/collections/products/points/delete`, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.QDRANT_API_KEY}`
      },
      body: {
        point: [
          iQdrant
        ]
      }
  });
  console.log(response)
  res.status(201).json({ message: 'Produk disimpan', data: product });
};

// PUT: Update produk
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { productName, price, stock, description, images, wishList, wishListId, kategori, gender, rating, terjual, uploadImageId } = req.body;

  try {
    const updated = await Product.findByIdAndUpdate(
      id,
      { productName, price, stock, description, images, wishList, wishListId, kategori, gender, rating, terjual, uploadImageId },
      { new: true },
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

const getProductByWishListId = async (req, res) => {
  const { id } = req.params;

  try {
    const produk = await Product.find({ wishListId: id });

    if (!produk) {
      return res.status(404).json({ message: 'produk tidak ditemukan' });
    }

    res.json(produk);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil produk', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getProductByWishListId
};