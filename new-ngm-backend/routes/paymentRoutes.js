const express = require('express');
const router = express.Router();
const { initializePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/paystack', protect, initializePayment);

module.exports = router;
