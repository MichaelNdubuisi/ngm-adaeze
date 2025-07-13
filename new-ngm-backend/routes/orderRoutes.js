const express = require('express');
const router = express.Router();

const {
  addOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  markOrderAsDelivered, // ✅ Add this
} = require('../controllers/orderController');

const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
router.post('/', protect, addOrder);

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
router.get('/myorders', protect, getMyOrders);

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
router.get('/', protect, admin, getAllOrders);

// @desc    Get order by ID (Admin or owner)
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', protect, getOrderById);

// ✅ NEW: Mark order as delivered (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
router.put('/:id/deliver', protect, admin, markOrderAsDelivered);

// ✅ NEW: Approve order (Admin)
// @route   PUT /api/orders/:id/approve
// @access  Private/Admin
const { approveOrder } = require('../controllers/orderController');
router.put('/:id/approve', protect, admin, approveOrder);

module.exports = router;
