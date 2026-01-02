const express = require("express");
const router = express.Router();

const {
  getAllCustomRequests,
  createCustomRequest,
  updateCustomRequestStatus,
  deleteCustomRequest
} = require("../controllers/customRequestController");

/**
 * @route   GET /api/custom-requests
 * @desc    Get all customization requests (Admin)
 */
router.get("/", getAllCustomRequests);

/**
 * @route   POST /api/custom-requests
 * @desc    Create new customization request (Customer)
 */
router.post("/", createCustomRequest);

/**
 * @route   PUT /api/custom-requests/:id
 * @desc    Update request status (Admin)
 */
router.put("/:id", updateCustomRequestStatus);

/**
 * @route   DELETE /api/custom-requests/:id
 * @desc    Delete customization request (Admin)
 */
router.delete("/:id", deleteCustomRequest);

module.exports = router;
