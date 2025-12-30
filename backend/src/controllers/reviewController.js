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
