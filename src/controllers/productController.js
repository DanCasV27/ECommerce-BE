const ProductService = require('../services/productService');

exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await ProductService.getAllProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};
exports.createProduct = async (req, res, next) => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}