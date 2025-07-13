const Order = require('../models/orderModel');
const User = require('../models/userModel'); // needed for email
const sendEmail = require('../utils/sendEmail');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private
exports.addOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // ✅ Send email after order is placed
    const user = await User.findById(req.user._id);
    await sendEmail(
      user.email,
      '🛒 Order Confirmation',
      `<h2>Hello ${user.name},</h2>
       <p>Thank you for your order!</p>
       <p><strong>Order ID:</strong> ${createdOrder._id}</p>
       <p><strong>Total:</strong> $${createdOrder.totalPrice}</p>
       <p>We’ll notify you when your order ships.</p>`
    );

    console.log('✅ Order created:', createdOrder._id);
    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('❌ addOrder error:', error.message);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/myorders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    console.error('❌ getMyOrders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    console.error('❌ getAllOrders error:', error.message);
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
};

// @desc    Approve order (Admin)
// @route   PUT /api/orders/:id/approve
// @access  Private/Admin
exports.approveOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    order.isPaid = true;
    order.paidAt = new Date();
    order.status = 'Processing';
    await order.save();
    res.json({ message: 'Order approved', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve order', error: error.message });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (user or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (req.user._id.equals(order.user._id) || req.user.isAdmin) {
      return res.json(order);
    } else {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }
  } catch (error) {
    console.error('❌ getOrderById error:', error.message);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// @desc    Mark order as delivered (Admin)
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
exports.markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = new Date();
    await order.save();

    // ✅ Send delivery email to customer
    await sendEmail(
      order.user.email,
      '📦 Order Delivered',
      `<h2>Hello ${order.user.name},</h2>
       <p>Your order <strong>${order._id}</strong> has been delivered.</p>
       <p>Thank you for shopping with us!</p>`
    );

    res.json({ message: 'Order marked as delivered' });
  } catch (error) {
    console.error('❌ markOrderAsDelivered error:', error.message);
    res.status(500).json({ message: 'Failed to mark as delivered', error: error.message });
  }
};
