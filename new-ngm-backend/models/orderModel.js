const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
      },
    ],

    shippingAddress: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      country: { type: String, required: true },
    },

    paymentMethod: {
      type: String,
      required: true,
      default: 'Bank Transfer', // or 'Paystack'
    },

    // This is used for both Paystack and Bank Transfers
    paymentResult: {
      reference: { type: String },        // Paystack reference
      status: { type: String },           // success, pending, failed
      email_address: { type: String },    // for Paystack or manual
      channel: { type: String },          // e.g., card, bank, etc.
      screenshot: { type: String },       // used only for bank transfer
      paidAt: { type: Date },             // actual payment time
    },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },

    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },

    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
