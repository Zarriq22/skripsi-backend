require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cartRoutes = require('./routes/cartRoutes');
const chatRoutes = require('./routes/chatRoutes');
const pesananRoutes = require('./routes/pesananRoutes');
const addressRoutes = require('./routes/addressRoutes');

const app = express();
const PORT = 5000;

// koneksi database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Terhubung ke MongoDB'))
.catch(err => console.error('❌ Gagal konek MongoDB:', err));

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://skripsi-frontend-sigma.vercel.app',
];

app.use(cors({
  origin: function(origin, callback) {
    // allow requests with no origin (like mobile apps, curl, postman)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Mengatur limit untuk muatan JSON
app.use(express.json({ limit: '50mb' }));

// Mengatur limit untuk muatan URL-encoded
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Route user
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);

// Routes produk
app.use('/api/products', productRoutes);

// Routes upload
app.use('/api/upload', uploadRoutes);

// Routes cart
app.use('/api/carts', cartRoutes);

// Routes chat
app.use('/api/chat', chatRoutes);

// Routes pesanan
app.use('/api/pesanan', pesananRoutes);

// Routes address
app.use('/api/address', addressRoutes);

// Cek koneksi
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server berjalan di http://0.0.0.0:${PORT}`);
});