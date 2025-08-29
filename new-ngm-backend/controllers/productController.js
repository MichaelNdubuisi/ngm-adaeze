const Product = require('../models/productModel');
const responseHelpers = require('../utils/responseHelpers');

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

    res.json(responseHelpers.success('Products fetched successfully!', {
      products,
      page,
      pages: Math.ceil(count / pageSize),
    }));
  } catch (err) {
    res.status(500).json(responseHelpers.serverError(err));
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
const mongoose = require('mongoose');

exports.getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json(responseHelpers.error('Hmm, that product ID doesn\'t look quite right. Please check and try again. 🔍'));
    }
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(responseHelpers.success('Product details loaded successfully!', product));
    } else {
      res.status(404).json(responseHelpers.notFound('Product'));
    }
  } catch (err) {
    res.status(500).json(responseHelpers.serverError(err));
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
      return res.status(400).json(responseHelpers.error('A picture is worth a thousand words! Please upload an image for this product. 📸'));
    }
    // Validate required fields
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json(responseHelpers.error('Every great product needs a name! Please give this one a title. ✏️'));
    }
    if (!brand || typeof brand !== 'string' || !brand.trim()) {
      return res.status(400).json(responseHelpers.error('Which brand makes this amazing product? We\'d love to know! 🏷️'));
    }
    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json(responseHelpers.error('Help shoppers find this product! Please choose a category. 📂'));
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return res.status(400).json(responseHelpers.error('Tell us more about this product! A good description helps customers understand what makes it special. 📝'));
    }
    // Parse price and countInStock
    price = parseFloat(price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json(responseHelpers.error('Products need a price! Please enter a positive number for the price. 💰'));
    }
    countInStock = parseInt(countInStock);
    if (isNaN(countInStock) || countInStock < 0) {
      return res.status(400).json(responseHelpers.error('How many of these do we have? Please enter a valid stock quantity (0 or more). 📦'));
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
      return res.status(400).json(responseHelpers.error('For clothing and shoes, sizes are essential! Please add at least one size option. 👕👟'));
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
    res.status(201).json(responseHelpers.success(responseHelpers.messages.created('Product'), createdProduct));
  } catch (err) {
    res.status(500).json(responseHelpers.serverError(err));
  }
};

// @desc    Update product (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
  try {
    const { name, image, brand, category, description, price, countInStock, sizes } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.image = image || product.image;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.description = description || product.description;
      product.price = price || product.price;
      product.countInStock = countInStock || product.countInStock;
      
      // Handle sizes field
      if (sizes !== undefined) {
        if (Array.isArray(sizes)) {
          product.sizes = sizes;
        } else if (typeof sizes === 'string') {
          product.sizes = sizes.split(',').map(s => s.trim()).filter(Boolean);
        }
      }

      const updatedProduct = await product.save();
      res.json(responseHelpers.success(responseHelpers.messages.updated('Product'), updatedProduct));
    } else {
      res.status(404).json(responseHelpers.notFound('Product'));
    }
  } catch (err) {
    res.status(500).json(responseHelpers.serverError(err));
  }
};

// @desc    Delete product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
  try {
    console.log('DELETE request for product:', req.params.id);
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (deleted) {
      console.log('Product deleted:', deleted._id);
      res.json(responseHelpers.success(responseHelpers.messages.deleted('Product')));
    } else {
      console.warn('Product not found for delete:', req.params.id);
      res.status(404).json(responseHelpers.notFound('Product'));
    }
  } catch (err) {
    console.error('Failed to delete product:', err.message);
    res.status(500).json(responseHelpers.serverError(err));
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
        return res.status(400).json(responseHelpers.error('You\'ve already shared your thoughts on this product! Thanks for your feedback. 💭'));
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
      res.status(201).json(responseHelpers.success('Thank you for your review! Your feedback helps other shoppers. 🌟'));
    } else {
      res.status(404).json(responseHelpers.notFound('Product'));
    }
  } catch (err) {
    res.status(500).json(responseHelpers.serverError(err));
  }
};
