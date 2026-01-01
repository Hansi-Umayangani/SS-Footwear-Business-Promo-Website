const pool = require("../config/db");

const Product = {
  getAll: async () => {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    return result.rows;
  },

  create: async (data) => {
    const { name, category, price, description, imageURL } = data;

    const result = await pool.query(
      `INSERT INTO products (name, category, price, description, image_url)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [name, category, price, description, imageURL]
    );

    return result.rows[0];
  }
};

module.exports = Product;
