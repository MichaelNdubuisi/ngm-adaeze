// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private (only the order owner or admin)
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Allow only the user who owns the order OR an admin
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
