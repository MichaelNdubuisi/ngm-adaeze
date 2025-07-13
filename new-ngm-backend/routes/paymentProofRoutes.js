const express = require('express');
const router = express.Router();
const { uploadProof, getAllProofs } = require('../controllers/paymentProofController');
const { protect, admin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Set up multer for proof uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/proofs'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// POST /api/payment-proofs (public)
router.post('/', upload.single('screenshot'), uploadProof);

// GET /api/payment-proofs (admin)
router.get('/', protect, admin, getAllProofs);

module.exports = router;
