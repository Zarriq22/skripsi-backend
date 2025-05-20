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
  image: {
    type: [String]
  },
  description: {
    type: String,
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
  subKategori: {
    type: String,
  },
  rating: {
    type: Number,
    default: 0
  },
  terjual: {
    type: Number,
    default: 0
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;