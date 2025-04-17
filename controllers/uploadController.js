const Avatar = require('../models/Uploads');

const uploadImage = async (req, res) => {
  const userId = req.user.userId; // Ini harus sesuai dengan isi token lo (decoded.userId)
  const { avatarBase64 } = req.body;

  if (!avatarBase64) {
    return res.status(400).json({ message: 'Avatar tidak boleh kosong' });
  }

  try {
    const avatar = await Avatar.findOneAndUpdate(
      { userId },
      { avatar: avatarBase64 },
      { upsert: true, new: true }
    );
    res.json({ message: 'Avatar berhasil disimpan', avatar });
  } catch (err) {
    res.status(500).json({ message: 'Gagal menyimpan avatar', error: err.message });
  }
};

const getAllImages = async (req, res) => {
    try {
      const avatars = await Avatar.find();
      res.json(avatars);
    } catch (err) {
      res.status(500).json({ message: 'Gagal mengambil data avatar', error: err.message });
    }
  };
  
  // GET avatar by userId (dari params)
  const getImageByUserId = async (req, res) => {
    const userId = req.params.userId;
  
    try {
      const avatar = await Avatar.findOne({ userId });
      if (!avatar) {
        return res.status(404).json({ message: 'Avatar tidak ditemukan' });
      }
      res.json(avatar);
    } catch (err) {
      res.status(500).json({ message: 'Gagal mengambil avatar', error: err.message });
    }
  };
  
  module.exports = {
    getAllImages,
    getImageByUserId,
    uploadImage,
  };