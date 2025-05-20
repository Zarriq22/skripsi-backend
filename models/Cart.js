const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    products: [
        {
            productId: {
                type: String,
            },
            productName: { 
                type: String, 
            },
            price: { 
                type: Number, 
            },
            quantity: {
                type: Number,
                default: 0
            },
            image: {
                type: String,
            },
            description: {
                type: String,
            }
        }    
    ]
});

module.exports = mongoose.model('Cart', cartSchema);