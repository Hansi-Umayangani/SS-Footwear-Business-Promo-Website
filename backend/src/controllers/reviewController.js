const { pool } = require("../config/db");

/* ---------------- ADD review ---------------- */
exports.addReview = async (req, res) => {
  try {
    const {
      name,
      email,
      product,
      rating,
      review,
      image_url
    } = req.body;

    // ✅ STRONG VALIDATION
    if (
      !name ||
      !email ||
      !product ||
      rating === undefined ||
      rating === null ||
      Number.isNaN(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5 ||
      !review
    ) {
      return res.status(400).json({
        message: "Missing or invalid fields"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO reviews (name, email, product, rating, review_text, image_url)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        name,
        email,
        product,
        Number(rating),
        review,
        image_url || null
      ]
    );

    res.status(201).json({
      success: true,
      review: result.rows[0]
    });

  } catch (error) {
    console.error("Add review error:", error);
    res.status(500).json({
      message: "Server error while adding review"
    });
  }
};

/* ---------------- GET reviews (public) ---------------- */
exports.getReviews = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reviews ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Fetch reviews error:", error);
    res.status(500).json({ message: "Server error while fetching reviews" });
  }
};

/* ---------------- GET reviews (admin) ---------------- */
exports.getAllReviewsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reviews ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Admin fetch reviews error:", error);
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/* ---------------- UPDATE review (admin) ---------------- */
exports.updateReviewAdmin = async (req, res) => {
  try {
    const { rating, review_text, product } = req.body;

    // Fetch existing review
    const existing = await pool.query(
      "SELECT product, review_text FROM reviews WHERE id = $1",
      [req.params.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Review not found" });
    }

    const existingProduct = existing.rows[0].product;
    const existingText = existing.rows[0].review_text;

    // 🔁 SAFE FALLBACKS
    const finalProduct =
      product && product.trim() !== ""
        ? product.trim()
        : existingProduct;

    const finalReviewText =
      review_text && review_text.trim() !== ""
        ? review_text.trim()
        : existingText;

    // HARD STOP
    if (!finalProduct || !finalReviewText) {
      return res.status(400).json({
        message: "Product and review text cannot be empty"
      });
    }

    // Validate rating
    if (
      rating === undefined ||
      Number.isNaN(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({ message: "Invalid rating" });
    }

    const result = await pool.query(
      `
      UPDATE reviews
      SET product = $1,
          rating = $2,
          review_text = $3,
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [finalProduct, Number(rating), finalReviewText, req.params.id]
    );

    res.status(200).json(result.rows[0]);

  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({ message: "Failed to update review" });
  }
};

/* ---------------- DELETE review (admin) ---------------- */
exports.deleteReviewAdmin = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM reviews WHERE id = $1",
      [req.params.id]
    );

    res.status(200).json({ message: "Review deleted" });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};
