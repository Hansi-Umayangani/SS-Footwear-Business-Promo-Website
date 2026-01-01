const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews,
  getAllReviewsAdmin,
  updateReviewAdmin,
  deleteReviewAdmin
} = require("../controllers/reviewController");

/**
 * CUSTOMER ROUTES
 */

// Add new review
router.post("/", addReview);

// Get approved reviews
router.get("/", getReviews);

/**
 * ADMIN ROUTES
 */

// Get all reviews (admin)
router.get("/admin", getAllReviewsAdmin);

// Update review (admin)
router.put("/admin/:id", updateReviewAdmin);

// Delete review (admin)
router.delete("/admin/:id", deleteReviewAdmin);

module.exports = router;
