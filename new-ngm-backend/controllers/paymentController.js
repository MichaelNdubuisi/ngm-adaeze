const axios = require('axios');

exports.initializePayment = async (req, res) => {
  const { email, amount } = req.body;

  if (!email || !amount) {
    return res.status(400).json({ message: 'Email and amount are required' });
  }

  try {
    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: Math.round(amount * 100), // Convert to kobo & sanitize
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json({
      status: 'success',
      data: response.data.data, // contains authorization_url, reference, etc.
    });
  } catch (err) {
    console.error('Paystack init error:', err.message);
    res.status(500).json({ status: 'error', message: 'Payment failed to initialize' });
  }
};
