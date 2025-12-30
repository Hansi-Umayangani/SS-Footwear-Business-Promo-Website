const CustomRequest = require("../models/CustomRequest.model");

// GET all
exports.getAllCustomRequests = async (req, res) => {
  try {
    const requests = await CustomRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE
exports.createCustomRequest = async (req, res) => {
  try {
    const request = new CustomRequest(req.body);
    await request.save();
    res.status(201).json({ message: "Customization request submitted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE status
exports.updateCustomRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    await CustomRequest.findByIdAndUpdate(id, { status });
    res.json({ message: "Status updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.deleteCustomRequest = async (req, res) => {
  try {
    await CustomRequest.findByIdAndDelete(req.params.id);
    res.json({ message: "Request deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
