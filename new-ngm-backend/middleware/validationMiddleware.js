// backend/middleware/validationMiddleware.js

const validateProduct = (req, res, next) => {
  const { name, price, description, countInStock } = req.body;

  if (!name || typeof name !== 'string') {
    return res.status(400).json({ message: 'Product name is required and must be a string.' });
  }

  // Accept price and countInStock as string (from FormData), coerce to number
  const priceNum = Number(price);
  if (price == null || price === '' || isNaN(priceNum)) {
    return res.status(400).json({ message: 'Product price is required and must be a number.' });
  }
  const countNum = Number(countInStock);
  if (countInStock == null || countInStock === '' || isNaN(countNum)) {
    return res.status(400).json({ message: 'Product countInStock is required and must be a number.' });
  }

  if (!description || typeof description !== 'string') {
    return res.status(400).json({ message: 'Product description is required and must be a string.' });
  }

  next();
};

module.exports = { validateProduct };
