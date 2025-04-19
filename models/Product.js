const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  stock: {
    type: Number,
    default: 0
  },
  image: {
    type: [String],
    required: true
  },
  description: {
    type: String,
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;