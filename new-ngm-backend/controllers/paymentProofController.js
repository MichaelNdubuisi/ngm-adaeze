const PaymentProof = require('../models/paymentProofModel');
const path = require('path');

// @desc    Upload payment proof
// @route   POST /api/payment-proofs
// @access  Public
exports.uploadProof = async (req, res) => {
  try {
    const { name, email, message, product, order } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Screenshot is required' });
    }
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const proof = new PaymentProof({
      user: req.user ? req.user._id : undefined,
      name,
      email,
      message,
      image: `/uploads/proofs/${req.file.filename}`,
      product: product || undefined,
      order: order || undefined
    });
    await proof.save();

    // If user and product are present, add to My Orders
    let createdOrder = null;
    if (req.user && product) {
      const Order = require('../models/orderModel');
      const Product = require('../models/productModel');
      const prod = await Product.findById(product);
      if (prod) {
        createdOrder = new Order({
          user: req.user._id,
          orderItems: [{
            name: prod.name,
            qty: 1,
            image: prod.image,
            price: prod.price,
            product: prod._id
          }],
          shippingAddress: {
            name: req.user.name || name,
            phone: '',
            address: '',
            country: ''
          },
          paymentMethod: 'Bank Transfer',
          paymentResult: {
            status: 'pending',
            screenshot: `/uploads/proofs/${req.file.filename}`,
            email_address: email
          },
          itemsPrice: prod.price,
          shippingPrice: 0,
          totalPrice: prod.price,
          isPaid: false
        });
        await createdOrder.save();
        proof.order = createdOrder._id;
        await proof.save();
      }
    }

    res.status(201).json({ message: 'Payment proof uploaded', proof, order });
  } catch (err) {
    res.status(500).json({ message: 'Failed to upload payment proof', error: err.message });
  }
};

// @desc    Get all payment proofs (admin)
// @route   GET /api/payment-proofs
// @access  Private/Admin
exports.getAllProofs = async (req, res) => {
  try {
    const proofs = await PaymentProof.find().populate('product').populate('order').sort({ createdAt: -1 });
    res.json(proofs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch payment proofs', error: err.message });
  }
};
