const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviews,
  getAllReviewsAdmin,
  updateReviewAdmin,
  deleteReviewAdmin
} = require("../controllers/reviewController");

// Customer
router.post("/", addReview);
router.get("/", getReviews);

// Admin
router.get("/admin", getAllReviewsAdmin);
router.put("/admin/:id", updateReviewAdmin);
router.delete("/admin/:id", deleteReviewAdmin);

module.exports = router;
