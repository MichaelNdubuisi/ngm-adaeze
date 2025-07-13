const Product = require('../models/productModel');

// @desc    Get all products with pagination + search
// @route   GET /api/products?page=1&keyword=shoes
// @access  Public
exports.getProducts = async (req, res) => {
  try {
    const pageSize = 10;
    const page = Number(req.query.page) || 1;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: 'i' } }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch products', error: err.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const mongoose = require('mongoose');

exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get product', error: err.message });
  }
};

// @desc    Create product (Admin)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
  try {
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);
    let { name, brand, category, description, price, countInStock } = req.body;
    // Debug: log all body keys, values, and types
    Object.entries(req.body).forEach(([k, v]) => {
      console.log(`BODY FIELD: ${k} =`, v, '| type:', typeof v);
    });
    let image = '';
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    } else {
      return res.status(400).json({ message: 'Product image is required.' });
    }
    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Product name is required.' });
    }
    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      return res.status(400).json({ message: 'Brand is required.' });
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ message: 'Category is required.' });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json({ message: 'Description is required.' });
    }
    // Parse price and countInStock
    price = parseFloat(price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ message: 'Product price is required and must be a positive number.' });
    }
    countInStock = parseInt(countInStock);
    if (isNaN(countInStock) || countInStock < 0) {
      return res.status(400).json({ message: 'Count in stock is required and must be a non-negative integer.' });
    }
    // Sizes validation for clothes/shoes
    let sizes = [];
    const needsSizes = category.trim().toLowerCase() === 'clothes' || category.trim().toLowerCase() === 'shoes';
    if (req.body.sizes) {
      if (Array.isArray(req.body.sizes)) {
        sizes = req.body.sizes;
      } else if (typeof req.body.sizes === 'string') {
        sizes = req.body.sizes.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (needsSizes && (!sizes || !Array.isArray(sizes) || sizes.length === 0)) {
      return res.status(400).json({ message: 'Sizes are required for clothes and shoes.' });
    }
    const product = new Product({
      user: req.user._id,
      name: name.trim(),
      image,
      brand: brand.trim(),
      category: category.trim(),
      description: description.trim(),
      price,
      countInStock,
      sizes,
    });
    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create product', error: err.message });
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, image, brand, category, description, price, countInStock } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.description = description || product.description;
      product.price = price || product.price;
      product.countInStock = countInStock || product.countInStock;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to update product', error: err.message });
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.remove();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete product', error: err.message });
  }
};

// ✅ @desc    Create new review
// @route     POST /api/products/:id/reviews
// @access    Private
exports.createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: 'Product already reviewed' });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.numReviews = product.reviews.length;
      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: 'Review added' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to create review', error: err.message });
  }
};
