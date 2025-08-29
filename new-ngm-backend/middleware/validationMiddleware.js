// backend/middleware/validationMiddleware.js
const responseHelpers = require('../utils/responseHelpers');

const validateProduct = (req, res, next) => {
  const { name, price, description, countInStock } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json(responseHelpers.error('Every great product needs a name! Please give this one a title. ✏️'));
  }

  // Accept price and countInStock as string (from FormData), coerce to number
  const priceNum = Number(price);
  if (price == null || price === '' || isNaN(priceNum)) {
    return res.status(400).json(responseHelpers.error('Products need a price! Please enter a positive number for the price. 💰'));
  }
  const countNum = Number(countInStock);
  if (countInStock == null || countInStock === '' || isNaN(countNum)) {
    return res.status(400).json(responseHelpers.error('How many of these do we have? Please enter a valid stock quantity (0 or more). 📦'));
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json(responseHelpers.error('Tell us more about this product! A good description helps customers understand what makes it special. 📝'));
  }

  next();
};

module.exports = { validateProduct };
