const express = require("express");

const {
  getAllCustomRequests,
  createCustomRequest,
  updateCustomRequestStatus,
  deleteCustomRequest
} = require("../controllers/customRequestController");

const router = express.Router();

/**
 * Admin customization request management
 */
router.get("/", getAllCustomRequests);
router.post("/", createCustomRequest);
router.put("/:id", updateCustomRequestStatus);
router.delete("/:id", deleteCustomRequest);

module.exports = router;
