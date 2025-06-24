const fs = require('fs/promises');
const path = require('path');
const Upload = require('../models/Uploads');
const Product = require('../models/Product');

const getAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find();
    res.status(200).json(uploads);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch uploads', error: error.message });
  }
};

const getUploadsByProduct = async (req, res) => {
  const { productId } = req.params;        // /uploads/product/:productId

  try {
    const uploads = await Upload.find({ productId }).lean(); // .lean() biar ringan
    if (!uploads.length) {
      return res.status(404).json({ message: 'No uploads found for this product' });
    }
    res.status(200).json(uploads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch uploads', error: err.message });
  }
};

const uploadFile = async (req, res) => {
  try {
    const { productId, userId } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const files = req.files.map(file => ({
      filename: file.originalname,
      path: file.path
    }));

    const upload = await Upload.create({
      files, // array of {filename, path}
      productId,
      userId
    });

    res.status(201).json({ message: 'Files uploaded successfully', upload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
};

const updateUpload = async (req, res) => {
  try {
    const { id } = req.params;
    const { productId, userId } = req.body;
    const mode = (req.query.mode || 'append').toLowerCase(); // default: append

    const upload = await Upload.findById(id);
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Handle file upload
    let newFiles = [];
    if (req.files && req.files.length > 0) {
      newFiles = req.files.map(file => ({
        filename: file.originalname,
        path: file.path
      }));

      if (mode === 'replace') {
        // hapus file lama dari disk
        await Promise.all(
          upload.files.map(f =>
            fs.unlink(path.resolve(f.path)).catch(() => null)
          )
        );
        upload.files = newFiles;
      } else {
        // mode append
        upload.files.push(...newFiles);
      }
    }

    // Update productId/userId jika dikirim
    if (productId) upload.productId = productId;
    if (userId) upload.userId = userId;

    await upload.save();

    res.status(200).json({ message: 'Upload updated successfully', upload });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

const deleteAllUploads = async (req, res) => {
  try {
    const uploads = await Upload.find();

    // Hapus semua file fisik di disk
    await Promise.all(
      uploads.flatMap(upload =>
        upload.files.map(file =>
          fs.unlink(path.resolve(file.path)).catch(() => null)
        )
      )
    );

    // Hapus semua dokumen Upload di MongoDB
    await Upload.deleteMany({});
    await Product.updateMany({}, { $unset: { uploadImageId: "" } });

    res.status(200).json({ message: 'Semua upload berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menghapus semua upload', error: error.message });
  }
};

const deleteUploadByProductId = async (req, res) => {
  const { productId } = req.params;

  try {
    const upload = await Upload.findOneAndDelete({ productId });

    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }

    // Hapus semua file fisik di disk
    await Promise.all(
      upload.files.map(file =>
        fs.unlink(path.resolve(file.path)).catch(() => null)
      )
    );

    res.status(200).json({ message: 'Upload deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete upload', error: error.message });
  }
};

module.exports = { getAllUploads, uploadFile, updateUpload, getUploadsByProduct, deleteAllUploads, deleteUploadByProductId };
