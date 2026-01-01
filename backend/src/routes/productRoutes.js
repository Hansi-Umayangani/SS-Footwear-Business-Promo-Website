const express = require("express");
const router = express.Router();

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

/**
 * @route   GET /api/products
 * @desc    Get all products
 */
router.get("/", getAllProducts);

/**
 * @route   POST /api/products
 * @desc    Create new product (Admin)
 */
router.post("/", createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product (Admin)
 */
router.put("/:id", updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product (Admin)
 */
router.delete("/:id", deleteProduct);

module.exports = router;
