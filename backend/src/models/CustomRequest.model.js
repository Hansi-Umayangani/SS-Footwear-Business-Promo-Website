const pool = require("../config/db");

const CustomRequest = {
  getAll: async () => {
    const result = await pool.query(
      "SELECT * FROM custom_requests ORDER BY created_at DESC"
    );
    return result.rows;
  },

  create: async (data) => {
    const {
      customerName,
      contactNumber,
      emailAddress,
      productType,
      customDetails,
      contactMethod
    } = data;

    await pool.query(
      `INSERT INTO custom_requests 
      (customer_name, contact_number, email_address, product_type, custom_details, contact_method)
      VALUES ($1,$2,$3,$4,$5,$6)`,
      [
        customerName,
        contactNumber,
        emailAddress,
        productType,
        customDetails,
        contactMethod
      ]
    );
  }
};

module.exports = CustomRequest;
