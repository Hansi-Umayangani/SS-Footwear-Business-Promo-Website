const Review = require("../models/Review");

/**
 * @desc   Add a new review
 * @route  POST /api/reviews
 */
exports.addReview = async (req, res) => {
  try {
    const {
      name,
      email,
      product,
      rating,
      reviewText,
      image
    } = req.body;

    if (!name || !email || !product || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields"
      });
    }

    const review = await Review.create({
      name,
      email,
      product,
      rating,
      reviewText,
      image
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding review"
    });
  }
};

/**
 * @desc   Get all reviews (latest first)
 * @route  GET /api/reviews
 */
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    res.status(500).json({
      message: "Server error while fetching reviews"
    });
  }
};

/**
 * @desc   Get all reviews (Admin)
 * @route  GET /api/admin/reviews
 */
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/**
 * @desc   Update review (Admin edit)
 * @route  PUT /api/admin/reviews/:id
 */
exports.updateReviewAdmin = async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Failed to update review" });
  }
};

/**
 * @desc   Delete review (Admin)
 * @route  DELETE /api/admin/reviews/:id
 */
exports.deleteReviewAdmin = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete review" });
  }
};
