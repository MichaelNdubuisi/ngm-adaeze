const mongoose = require('mongoose');

const paymentProofSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false // allow anonymous
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: false // allow anonymous/manual
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: false // allow manual
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String },
    image: { type: String, required: true }, // path to uploaded screenshot
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentProof', paymentProofSchema);
