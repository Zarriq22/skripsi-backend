const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTER
const registerUser = async (req, res) => {
  const { username, password, initialName, avatar, userType } = req.body;

  try {
    // Cek user sudah ada?
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ message: 'Username sudah terdaftar' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    // Simpan user baru
    const user = new User({ username, password: hashed, initialName, avatar, userType });
    await user.save();

    res.status(201).json({ message: 'Register berhasil', userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Gagal register', error: err.message });
  }
};

// LOGIN
const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: 'Username tidak ditemukan' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Password salah' });

    // Buat token JWT
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      message: 'Login berhasil',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.userType === 1 ? 'admin' : 'user',
        initialName: user.initialName
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Gagal login', error: err.message });
  }
};


// API ALL USER
const getAllUsers = async (req, res) => {
  const user = await User.find();
  res.json(user);
};

const getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil user', error: error.message });
  }
};

const addUser = async (req, res) => {
  const { username, password, initialName, userType } = req.body;
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const user = new User({ username, password: hashed, initialName, userType });
  await user.save();
  res.status(201).json({ message: 'User disimpan', data: user });
};

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, initialName, userType } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { username, password: hashed, initialName, userType },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'User diperbarui', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update', error });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ message: 'Gagal hapus', error });
  }
};

const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  try {
    const updated = await User.findByIdAndUpdate(
      id,
      { password: hashed },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    res.json({ message: 'Password diperbarui', data: updated });
  } catch (error) {
    res.status(500).json({ message: 'Gagal update', error });
  }
};

module.exports = { registerUser, loginUser, getAllUsers, getUserById, addUser, updateUser, updatePassword, deleteUser };