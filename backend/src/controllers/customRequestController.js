const { pool } = require("../config/db");

/* ---------------- GET all custom requests ---------------- */
exports.getAllCustomRequests = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        customer_name   AS "customerName",
        contact_number  AS "contactNumber",
        email_address   AS "emailAddress",
        product_type    AS "productType",
        custom_details  AS "customDetails",
        contact_method  AS "contactMethod",
        status,
        created_at      AS "createdAt"
      FROM custom_requests
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("Fetch custom requests error:", error);
    res.status(500).json({ error: "Failed to fetch custom requests" });
  }
};

/* ---------------- CREATE custom request ---------------- */
exports.createCustomRequest = async (req, res) => {
  try {
    const {
      customerName,
      contactNumber,
      emailAddress,
      productType,
      customDetails,
      contactMethod
    } = req.body;

    /* -------- Server-side validation -------- */
    if (!customerName || !contactNumber || !emailAddress || !contactMethod) {
      return res.status(400).json({
        error: "Missing required fields"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO custom_requests (
        customer_name,
        contact_number,
        email_address,
        product_type,
        custom_details,
        contact_method
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        id,
        customer_name  AS "customerName",
        contact_number AS "contactNumber",
        email_address  AS "emailAddress",
        product_type   AS "productType",
        custom_details AS "customDetails",
        contact_method AS "contactMethod",
        status,
        created_at     AS "createdAt";
      `,
      [
        customerName,
        contactNumber,
        emailAddress,
        productType || null,
        customDetails || null,
        contactMethod
      ]
    );

    res.status(201).json({
      message: "Customization request submitted successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Create custom request error:", error);
    res.status(500).json({
      error: "Failed to submit customization request"
    });
  }
};

/* ---------------- UPDATE status ---------------- */
exports.updateCustomRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // must match DB CHECK constraint
    const allowedStatus = ["pending", "contacted", "completed", "cancelled"];
    if (!allowedStatus.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    await pool.query(
      "UPDATE custom_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [status, id]
    );

    res.json({ message: "Status updated successfully" });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Failed to update status" });
  }
};

/* ---------------- DELETE ---------------- */
exports.deleteCustomRequest = async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM custom_requests WHERE id = $1",
      [req.params.id]
    );

    res.json({ message: "Custom request deleted" });
  } catch (error) {
    console.error("Delete custom request error:", error);
    res.status(500).json({ error: "Failed to delete custom request" });
  }
};
