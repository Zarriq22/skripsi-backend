const mongoose = require('mongoose');

const pesananSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now
  },
  productName: { 
    type: String, 
  },
  productId: { 
    type: String, 
  },
  userId: { 
    type: String, 
  },
  price: { 
    type: Number, 
  },
  image: {
    type: [String]
  },
  description: {
    type: String,
  },
  status: {
    type: Number,
    default: 0
  },
  resi: {
    type: String,
  }
});

const Pesanan = mongoose.model('Pesanan', pesananSchema);
module.exports = Pesanan;