require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

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
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Route user
app.use('/api/auth', authRoutes);
app.use('/api/users', authRoutes);

// Routes produk
app.use('/api/products', productRoutes);

// Routes upload
app.use('/api/upload', uploadRoutes);

// Cek koneksi
app.get('/', (req, res) => {
  res.send('API is running...');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});