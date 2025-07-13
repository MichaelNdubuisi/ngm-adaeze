const express = require('express');
const crypto = require('crypto');
const Order = require('../models/orderModel');

const router = express.Router();

// Middleware: Raw body is needed to verify Paystack signature
router.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

router.post('/', async (req, res) => {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  // Verify Paystack signature
  const hash = crypto.createHmac('sha512', secret)
    .update(req.rawBody)
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;

  // Only handle successful payments
  if (event.event === 'charge.success') {
    const { reference, paid_at, channel, status } = event.data;

    try {
      const order = await Order.findOne({ 'paymentResult.reference': reference });

      if (order && !order.isPaid) {
        order.isPaid = true;
        order.paidAt = new Date(paid_at);
        order.paymentMethod = 'Paystack';
        order.paymentResult = {
          reference,
          status,
          channel,
          paidAt: new Date(paid_at),
        };

        await order.save();
        console.log(`✅ Order ${order._id} marked as paid.`);
      } else {
        console.log('⚠️ Order already paid or not found.');
      }

    } catch (err) {
      console.error('❌ Error updating order:', err.message);
    }
  }

  // Always respond 200 to prevent Paystack retries
  res.sendStatus(200);
});

module.exports = router;
