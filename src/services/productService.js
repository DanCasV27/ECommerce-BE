const Product = require('../models/Product');

exports.getAllProducts = async () => {
  return await Product.find();
};

exports.createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
}