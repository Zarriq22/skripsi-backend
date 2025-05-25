const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
    },
    address: [
        {
            alamat: {
                type: String,
            },
            alamatUtama: {
                type: Boolean,
                default: false
            }
        }
    ]
});

module.exports = mongoose.model('Address', addressSchema);