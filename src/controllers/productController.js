const ProductService = require('../services/productService');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};