const { pool } = require("../config/db");

/* ---------------- GET all products ---------------- */
exports.getAllProducts = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM products ORDER BY created_at DESC"
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Fetch products error:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ---------------- CREATE product ---------------- */
exports.createProduct = async (req, res) => {
  try {
    const { name, category, price, description, imageURL } = req.body;

    const result = await pool.query(
      `
      INSERT INTO products (name, category, price, description, image_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [name, category, price, description, imageURL]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: "Failed to create product" });
  }
};

/* ---------------- UPDATE product ---------------- */
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, price, description, imageURL } = req.body;

    const result = await pool.query(
      `
      UPDATE products
      SET name=$1, category=$2, price=$3, description=$4, image_url=$5
      WHERE id=$6
      RETURNING *
      `,
      [name, category, price, description, imageURL, req.params.id]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: "Failed to update product" });
  }
};

/* ---------------- DELETE product ---------------- */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
