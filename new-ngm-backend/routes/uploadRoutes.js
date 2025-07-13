const express = require('express');
const router = express.Router();
const fs = require('fs');
const upload = require('../middleware/upload');
const cloudinary = require('../utils/cloudinary');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, admin, upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'ecommerce-products',
    });

    // Safe file deletion
    try {
      fs.unlinkSync(req.file.path);
    } catch (fsErr) {
      console.warn('⚠️ Failed to delete temp file:', fsErr.message);
    }

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed', error: err.message });
  }
});

module.exports = router;
