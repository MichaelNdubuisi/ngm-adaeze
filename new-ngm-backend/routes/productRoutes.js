const express = require('express');
const router = express.Router();

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview, // ✅ Add review controller
} = require('../controllers/productController');

const { protect, admin } = require('../middleware/authMiddleware');
const { validateProduct } = require('../middleware/validationMiddleware'); // ✅ Ensure this exists

// --------------------
// Public Routes
// --------------------
router.get('/', getProducts);                // GET all products with search + pagination
router.get('/:id', getProductById);          // GET single product by ID
router.post('/:id/reviews', protect, createProductReview); // ✅ POST product review

// --------------------
// Admin Routes
// --------------------
const upload = require('../middleware/upload');

router.post('/', protect, admin, upload.single('image'), validateProduct, createProduct);     // Create new product
router.put('/:id', protect, admin, validateProduct, updateProduct);   // Update product
router.delete('/:id', protect, admin, deleteProduct);                 // Delete product

module.exports = router;
