const pool = require("../config/db");

const Review = {
  getApproved: async () => {
    const result = await pool.query(
      "SELECT * FROM reviews WHERE is_approved = true ORDER BY created_at DESC"
    );
    return result.rows;
  },

  create: async (data) => {
    const { name, email, product, rating, reviewText, image_url } = data;

    const result = await pool.query(
      `INSERT INTO reviews
      (name, email, product, rating, review_text, image_url)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [name, email, product, rating, reviewText, image_url]
    );

    return result.rows[0];
  }
};

module.exports = Review;
