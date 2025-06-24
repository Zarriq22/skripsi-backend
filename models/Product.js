const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  productName: { 
    type: String, 
  },
  price: { 
    type: Number, 
  },
  stock: {
    type: Number,
    default: 0
  },
  images: [
    {
      filename: String,
      path: String
    }
  ],
  description: {
    type: String,
  },
  spesifikasi: {
    bahan: {
      type: String,
    },
    ukuran: {
      type: String,
    },
    warna: {
      type: String,
    },
    fitur: {
      type: [String],
    }
  },
  wishList: {
    type: Boolean,
    default: false
  },
  wishListId: {
    type: String,
  },
  kategori: {
    type: String,
  },
  gender: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0
  },
  terjual: {
    type: Number,
    default: 0
  },
  uploadImageId: {
    type: String,
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;