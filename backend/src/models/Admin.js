const pool = require("../config/db");

const Admin = {
  findByEmail: async (email) => {
    const result = await pool.query(
      "SELECT * FROM admins WHERE email = $1",
      [email]
    );
    return result.rows[0];
  },

  create: async (email, password) => {
    const result = await pool.query(
      "INSERT INTO admins (email, password) VALUES ($1, $2) RETURNING *",
      [email, password]
    );
    return result.rows[0];
  }
};

module.exports = Admin;
