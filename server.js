require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const cartRoutes = require('./routes/cartRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const PORT = 5000;

const allowedOrigins = ['https://skripsi-frontend-sigma.vercel.app'];

// koneksi database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Terhubung ke MongoDB'))
.catch(err => console.error('❌ Gagal konek MongoDB:', err));

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Penting kalau kamu pakai cookie/token
}));
app.use(express.json());

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

// Cek koneksi
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});