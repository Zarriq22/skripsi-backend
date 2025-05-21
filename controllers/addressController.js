const Address = require('../models/Address');

// Ambil semua alamat untuk user tertentu
const getAllAddress = async (req, res) => {
    const address = await Address.find();
    res.json(address);
};

// Tambah alamat (push ke array)
const addAddress = async (req, res) => {
    const { userId, alamat } = req.body;

    try {
        let addressDoc = await Address.findOne({ userId });

        if (!addressDoc) {
            addressDoc = new Address({
                userId,
                address: [{ alamat }]  // mongoose otomatis generate _id
            });
        } else {
            addressDoc.address.push({ alamat });
        }

        const savedAddress = await addressDoc.save();

        res.status(201).json({
            message: 'Alamat berhasil ditambahkan',
            data: {
                userId: savedAddress.userId,
                address: savedAddress.address
            }
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal menambahkan alamat',
            error: error.message
        });
    }
};

// Ubah alamat berdasarkan index di array
const updateAddress = async (req, res) => {
    const { userId, alamatBaru } = req.body;
    const { id } = req.params; // ini _id dari address yang mau diupdate

    try {
        const addressDoc = await Address.findOne({ userId });

        if (!addressDoc) {
            return res.status(404).json({ message: 'Data user tidak ditemukan' });
        }

        // Cari address subdocument berdasarkan _id
        const subdoc = addressDoc.address.id(id);

        if (!subdoc) {
            return res.status(404).json({ message: 'Alamat dengan id tersebut tidak ditemukan' });
        }

        // Update alamatnya
        subdoc.alamat = alamatBaru;

        await addressDoc.save();

        res.json({
            message: 'Alamat berhasil diperbarui',
            data: addressDoc.address
        });
    } catch (error) {
        res.status(500).json({
            message: 'Gagal memperbarui alamat',
            error: error.message
        });
    }
};

// Hapus alamat berdasarkan index
const deleteAddressById = async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params;

  try {
    const updatedDoc = await Address.findOneAndUpdate(
      { userId, 'address._id': id },
      { $pull: { address: { _id: id } } },
      { new: true }
    );

    if (!updatedDoc) {
      return res.status(404).json({ message: 'Alamat dengan id tersebut tidak ditemukan' });
    }

    res.json({ message: 'Alamat berhasil dihapus', data: updatedDoc.address });
  } catch (error) {
    res.status(500).json({ message: 'Gagal menghapus alamat', error: error.message });
  }
};

const deleteAddress = async (req, res) => {
    const { id } = req.params;

    try {
        const deleted = await Address.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: 'Alamat tidak ditemukan' });
        }

        res.json({ message: 'Alamat berhasil dihapus' });
    } catch (error) {
        res.status(500).json({ message: 'Gagal menghapus alamat', error });
    }
};

module.exports = {
    getAllAddress,
    addAddress,
    updateAddress,
    deleteAddressById,
    deleteAddress
};
